// backend/libs/gemini-ai.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search for similar legal cases using Tavily API
 * @param {string} caseTitle - Title of the case
 * @param {string} courtName - Court name
 * @param {string} description - Case description
 */
export const searchSimilarCases = async (caseTitle, courtName, description) => {
  try {
    if (!process.env.TAVILY_API_KEY) {
      console.warn("Tavily API key not configured");
      return [];
    }

    const searchQuery = `${caseTitle} ${courtName} similar legal cases India`;

    const response = await axios.post("https://api.tavily.com/search", {
      api_key: process.env.TAVILY_API_KEY,
      query: searchQuery,
      search_depth: "basic",
      include_answer: false,
      max_results: 3,
      include_domains: ["indiankanoon.org", "scconline.com", "manupatra.com"],
    });

    const results = response.data.results || [];

    return results.slice(0, 2).map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content,
    }));
  } catch (error) {
    console.error("Error searching similar cases:", error.message);
    return [];
  }
};

/**
 * Generate case summary and context
 * @param {Object} task - Task/Case object
 */
export const generateCaseSummary = async (task) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Prepare case context
    const hearingsText = task.hearings?.length
      ? task.hearings
          .map(
            (h, i) =>
              `${i + 1}. ${new Date(h.date).toLocaleDateString()} - ${
                h.description || "No details"
              } (${h.inFavour ? "In Favour" : "Not in Favour"})`
          )
          .join("\n")
      : "No hearings recorded yet";

    const subtasksText = task.subtasks?.length
      ? task.subtasks.map((s, i) => `${i + 1}. ${s.title}`).join("\n")
      : "No subtasks";

    const assigneesText = task.assignees?.length
      ? task.assignees.map((a) => a.name).join(", ")
      : "None";

    const prompt = `You are a legal AI assistant for Indian law. Provide a concise summary of this case in 3-4 sentences:

**Case Title:** ${task.title}
**Court Name:** ${task.courtName || "Not specified"}
**Description:** ${task.description || "No description provided"}
**Status:** ${task.status}
**Priority:** ${task.priority}
**Due Date:** ${new Date(task.dueDate).toLocaleDateString()}
**Assigned To:** ${assigneesText}

**Hearings:**
${hearingsText}

**Subtasks:**
${subtasksText}

Provide a professional summary focusing on:
1. Nature of the case
2. Current status and progress
3. Key hearings outcomes
4. Next steps or pending actions

Keep it concise and professional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating case summary:", error.message);
    return "Unable to generate summary at this moment.";
  }
};

/**
 * Chat with AI about a specific case
 * @param {Object} task - Task/Case object
 * @param {string} userMessage - User's question
 * @param {Array} chatHistory - Previous chat messages
 */
export const chatWithCaseAI = async (task, userMessage, chatHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Prepare case context
    const hearingsText = task.hearings?.length
      ? task.hearings
          .map(
            (h, i) =>
              `${i + 1}. Date: ${new Date(
                h.date
              ).toLocaleDateString()}, Details: ${
                h.description || "No details"
              }, Outcome: ${h.inFavour ? "In Favour" : "Not in Favour"}`
          )
          .join("\n")
      : "No hearings recorded";

    const subtasksText = task.subtasks?.length
      ? task.subtasks
          .map(
            (s, i) =>
              `${i + 1}. ${s.title} (${s.completed ? "Completed" : "Pending"})`
          )
          .join("\n")
      : "No subtasks";

    const systemPrompt = `You are a specialized legal AI assistant.

**STRICT SECURITY RULES**
- You MUST only use internal database information for THIS case: "${
      task.title
    }".
- You MUST NOT reveal or provide details about any OTHER cases from the database.
- You CAN use your general legal knowledge (Indian law, IPC, CrPC, Constitution, famous public cases).
- You CAN suggest or explain precedents and examples from PUBLIC sources (e.g., IndianKanoon, SCC Online).
- If the user asks about other internal cases: 
  → Reply: "I cannot provide details from other cases in the system. Please open that specific case to view it."
- If the user asks for "similar cases": 
  → Provide PUBLICLY available similar cases (not from database). 
  → You may rely on your legal knowledge or external API results (like Tavily).
- If the user asks about law & order, general legal concepts, or strategies: 
  → Answer normally using your public legal knowledge.

**CASE CONTEXT (from internal DB):**
- Title: ${task.title}
- Court: ${task.courtName || "Not specified"}
- Description: ${task.description || "No description"}
- Status: ${task.status}
- Priority: ${task.priority}
- Due Date: ${new Date(task.dueDate).toLocaleDateString()}
- Created: ${new Date(task.createdAt).toLocaleDateString()}

**Hearings:**
${hearingsText}

**Subtasks:**
${subtasksText}

**YOUR ROLE**
- Answer case-specific questions using ONLY the above case context.
- For legal concepts and general law questions, use your public knowledge.
- For similar cases, provide PUBLIC examples and precedents, but not internal DB cases.
- Always reply in a professional and concise legal assistant tone.


**If asked about other cases:** "I can only discuss details of the current case (${
      task.title
    }). For other cases, please open that specific case page."

Now respond to the user's question professionally and helpfully.`;

    // Build chat history for context
    const chatMessages = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I'll only discuss this specific case and provide legal assistance within these boundaries.",
          },
        ],
      },
    ];

    // Add previous chat history (last 5 messages for context)
    const recentHistory = chatHistory.slice(-5);
    recentHistory.forEach((msg) => {
      chatMessages.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    });

    // Add current user message
    chatMessages.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const chat = model.startChat({
      history: chatMessages.slice(0, -1), // All except last message
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Error in AI chat:", error.message);

    if (error.message.includes("SAFETY")) {
      return "I cannot respond to that query. Please keep questions professional and related to legal matters.";
    }

    return "I'm having trouble processing that request. Please try rephrasing your question.";
  }
};

/**
 * Validate if question is about the current case
 */
export const isQuestionRelevant = async (question, caseTitle) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Analyze if this question is asking about a DIFFERENT case or trying to access information about OTHER cases:

Question: "${question}"
Current Case: "${caseTitle}"

Respond with ONLY "YES" if the question is:
- Asking about this specific case
- General legal advice
- Legal terminology
- Case strategies

Respond with ONLY "NO" if the question is:
- Asking about other cases
- Trying to get information about different matters
- Requesting database information

Response (YES/NO):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim().toUpperCase();

    return answer.includes("YES");
  } catch (error) {
    console.error("Error validating question:", error);
    return true; // Allow by default if validation fails
  }
};
