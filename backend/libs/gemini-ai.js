// // backend/libs/gemini-ai.js
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import axios from "axios";

// // Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /**
//  * Search for similar legal cases using Tavily API
//  * @param {string} caseTitle - Title of the case
//  * @param {string} courtName - Court name
//  * @param {string} description - Case description
//  */
// export const searchSimilarCases = async (caseTitle, courtName, description) => {
//   try {
//     if (!process.env.TAVILY_API_KEY) {
//       console.warn("Tavily API key not configured");
//       return [];
//     }

//     const searchQuery = `${caseTitle} ${courtName} similar legal cases India`;

//     const response = await axios.post("https://api.tavily.com/search", {
//       api_key: process.env.TAVILY_API_KEY,
//       query: searchQuery,
//       search_depth: "basic",
//       include_answer: false,
//       max_results: 3,
//       include_domains: ["indiankanoon.org", "scconline.com", "manupatra.com"],
//     });

//     const results = response.data.results || [];

//     return results.slice(0, 2).map((result) => ({
//       title: result.title,
//       url: result.url,
//       snippet: result.content,
//     }));
//   } catch (error) {
//     console.error("Error searching similar cases:", error.message);
//     return [];
//   }
// };

// /**
//  * Generate case summary and context
//  * @param {Object} task - Task/Case object
//  */
// export const generateCaseSummary = async (task) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

//     // Prepare case context
//     const hearingsText = task.hearings?.length
//       ? task.hearings
//           .map(
//             (h, i) =>
//               `${i + 1}. ${new Date(h.date).toLocaleDateString()} - ${
//                 h.description || "No details"
//               } (${h.inFavour ? "In Favour" : "Not in Favour"})`
//           )
//           .join("\n")
//       : "No hearings recorded yet";

//     const subtasksText = task.subtasks?.length
//       ? task.subtasks.map((s, i) => `${i + 1}. ${s.title}`).join("\n")
//       : "No subtasks";

//     const assigneesText = task.assignees?.length
//       ? task.assignees.map((a) => a.name).join(", ")
//       : "None";

//     const prompt = `You are a legal AI assistant for Indian law. Provide a concise summary of this case in 3-4 sentences:

// **Case Title:** ${task.title}
// **Court Name:** ${task.courtName || "Not specified"}
// **Description:** ${task.description || "No description provided"}
// **Status:** ${task.status}
// **Priority:** ${task.priority}
// **Due Date:** ${new Date(task.dueDate).toLocaleDateString()}
// **Assigned To:** ${assigneesText}

// **Hearings:**
// ${hearingsText}

// **Subtasks:**
// ${subtasksText}

// Provide a professional summary focusing on:
// 1. Nature of the case
// 2. Current status and progress
// 3. Key hearings outcomes
// 4. Next steps or pending actions

// Keep it concise and professional.`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error generating case summary:", error.message);
//     return "Unable to generate summary at this moment.";
//   }
// };

// /**
//  * Chat with AI about a specific case
//  * @param {Object} task - Task/Case object
//  * @param {string} userMessage - User's question
//  * @param {Array} chatHistory - Previous chat messages
//  */
// export const chatWithCaseAI = async (task, userMessage, chatHistory = []) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

//     // Prepare case context
//     const hearingsText = task.hearings?.length
//       ? task.hearings
//           .map(
//             (h, i) =>
//               `${i + 1}. Date: ${new Date(
//                 h.date
//               ).toLocaleDateString()}, Details: ${
//                 h.description || "No details"
//               }, Outcome: ${h.inFavour ? "In Favour" : "Not in Favour"}`
//           )
//           .join("\n")
//       : "No hearings recorded";

//     const subtasksText = task.subtasks?.length
//       ? task.subtasks
//           .map(
//             (s, i) =>
//               `${i + 1}. ${s.title} (${s.completed ? "Completed" : "Pending"})`
//           )
//           .join("\n")
//       : "No subtasks";

//     const systemPrompt = `You are a specialized legal AI assistant.

// **STRICT SECURITY RULES**
// - You MUST only use internal database information for THIS case: "${
//       task.title
//     }".
// - You MUST NOT reveal or provide details about any OTHER cases from the database.
// - You CAN use your general legal knowledge (Indian law, IPC, CrPC, Constitution, famous public cases).
// - You CAN suggest or explain precedents and examples from PUBLIC sources (e.g., IndianKanoon, SCC Online).
// - If the user asks about other internal cases:
//   → Reply: "I cannot provide details from other cases in the system. Please open that specific case to view it."
// - If the user asks for "similar cases":
//   → Provide PUBLICLY available similar cases (not from database).
//   → You may rely on your legal knowledge or external API results (like Tavily).
// - If the user asks about law & order, general legal concepts, or strategies:
//   → Answer normally using your public legal knowledge.

// **CASE CONTEXT (from internal DB):**
// - Title: ${task.title}
// - Court: ${task.courtName || "Not specified"}
// - Description: ${task.description || "No description"}
// - Status: ${task.status}
// - Priority: ${task.priority}
// - Due Date: ${new Date(task.dueDate).toLocaleDateString()}
// - Created: ${new Date(task.createdAt).toLocaleDateString()}

// **Hearings:**
// ${hearingsText}

// **Subtasks:**
// ${subtasksText}

// **YOUR ROLE**
// - Answer case-specific questions using ONLY the above case context.
// - For legal concepts and general law questions, use your public knowledge.
// - For similar cases, provide PUBLIC examples and precedents, but not internal DB cases.
// - Always reply in a professional and concise legal assistant tone.

// **If asked about other cases:** "I can only discuss details of the current case (${
//       task.title
//     }). For other cases, please open that specific case page."

// Now respond to the user's question professionally and helpfully.`;

//     // Build chat history for context
//     const chatMessages = [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt }],
//       },
//       {
//         role: "model",
//         parts: [
//           {
//             text: "Understood. I'll only discuss this specific case and provide legal assistance within these boundaries.",
//           },
//         ],
//       },
//     ];

//     // Add previous chat history (last 5 messages for context)
//     const recentHistory = chatHistory.slice(-5);
//     recentHistory.forEach((msg) => {
//       chatMessages.push({
//         role: msg.role === "user" ? "user" : "model",
//         parts: [{ text: msg.content }],
//       });
//     });

//     // Add current user message
//     chatMessages.push({
//       role: "user",
//       parts: [{ text: userMessage }],
//     });

//     const chat = model.startChat({
//       history: chatMessages.slice(0, -1), // All except last message
//       generationConfig: {
//         maxOutputTokens: 500,
//         temperature: 0.7,
//       },
//     });

//     const result = await chat.sendMessage(userMessage);
//     const response = await result.response;

//     return response.text();
//   } catch (error) {
//     console.error("Error in AI chat:", error.message);

//     if (error.message.includes("SAFETY")) {
//       return "I cannot respond to that query. Please keep questions professional and related to legal matters.";
//     }

//     return "I'm having trouble processing that request. Please try rephrasing your question.";
//   }
// };

// /**
//  * Validate if question is about the current case
//  */
// export const isQuestionRelevant = async (question, caseTitle) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

//     const prompt = `Analyze if this question is asking about a DIFFERENT case or trying to access information about OTHER cases:

// Question: "${question}"
// Current Case: "${caseTitle}"

// Respond with ONLY "YES" if the question is:
// - Asking about this specific case
// - General legal advice
// - Legal terminology
// - Case strategies

// Respond with ONLY "NO" if the question is:
// - Asking about other cases
// - Trying to get information about different matters
// - Requesting database information

// Response (YES/NO):`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const answer = response.text().trim().toUpperCase();

//     return answer.includes("YES");
//   } catch (error) {
//     console.error("Error validating question:", error);
//     return true; // Allow by default if validation fails
//   }
// };
// backend/libs/gemini-ai.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search for similar legal cases using Tavily API
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
 */
export const generateCaseSummary = async (task) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

    const commentsText = task.comments?.length
      ? task.comments
          .map(
            (c, i) => `${i + 1}. ${c.text} (by ${c.user?.name || "Unknown"})`
          )
          .join("\n")
      : "No comments";

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

**Comments/Discussions:**
${commentsText}

Provide a professional summary focusing on:
1. Nature of the case
2. Current status and progress
3. Key hearings outcomes
4. Important comments or updates
5. Next steps or pending actions

Keep it concise and professional. Do not leave response empty.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // ✅ FIX: Handle empty responses
    if (!text || text.trim().length === 0) {
      return `Case: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}\n\nThis case requires detailed analysis. Please ask specific questions about hearings, progress, or legal matters.`;
    }

    return text;
  } catch (error) {
    console.error("Error generating case summary:", error.message);
    return "Unable to generate summary at this moment. Please try asking specific questions about the case.";
  }
};

/**
 * Chat with AI about a specific case
 */
export const chatWithCaseAI = async (task, userMessage, chatHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

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

    const commentsText = task.comments?.length
      ? task.comments
          .map(
            (c, i) =>
              `${i + 1}. ${c.text} (by ${
                c.user?.name || "Unknown"
              } on ${new Date(c.createdAt).toLocaleDateString()})`
          )
          .join("\n")
      : "No comments";

    const systemPrompt = `You are a specialized legal AI assistant for Indian law.

**STRICT RULES - YOU MUST ALWAYS PROVIDE A RESPONSE:**
- NEVER return empty or blank responses
- If unsure, provide general legal information
- Always answer the user's question professionally

**SECURITY RULES:**
- Use internal database information ONLY for THIS case: "${task.title}"
- DO NOT reveal details about OTHER cases from the database
- You CAN answer general legal questions about:
  → Indian Penal Code (IPC), CrPC, Constitution, Civil Procedure Code
  → Legal concepts, terminology, and procedures
  → Famous public cases and precedents
  → Legal strategies and best practices
  → Court procedures and documentation
- If asked about OTHER internal cases: Reply "I cannot provide details from other cases in the system."
- If asked for similar cases: Provide PUBLICLY available examples

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

**Comments/Discussions:**
${commentsText}

**YOUR ROLE:**
- Answer case-specific questions using ONLY the above case context
- For general law questions (IPC sections, legal concepts, procedures): Use your extensive legal knowledge
- Provide helpful legal advice, explain Indian law concepts, and suggest strategies
- For similar cases: Provide PUBLIC examples and precedents from Indian legal history
- Always reply professionally and NEVER leave response empty

**EXAMPLES OF QUESTIONS YOU MUST ANSWER:**
- "What is IPC related to suicide?" → Explain Section 306, 309 IPC
- "What is hearing update on this case?" → Use the Hearings data above
- "What are bail provisions?" → Explain bail law in India
- "What is the case progress?" → Summarize from the context above

Now respond to the user's question helpfully and professionally. NEVER return empty response.`;

    // Build chat for better context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I will provide helpful legal assistance using case context and my knowledge of Indian law. I will never leave responses empty.",
            },
          ],
        },
        // Add recent chat history
        ...chatHistory
          .slice(-4)
          .flatMap((msg) => [
            {
              role: "user",
              parts: [{ text: msg.role === "user" ? msg.content : "" }],
            },
            {
              role: "model",
              parts: [{ text: msg.role === "assistant" ? msg.content : "" }],
            },
          ])
          .filter((msg) => msg.parts[0].text),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // ✅ FIX: Handle blank responses with fallback
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ Gemini returned empty response, providing fallback");

      // Check if it's about hearings
      if (userMessage.toLowerCase().includes("hearing")) {
        if (task.hearings?.length > 0) {
          const lastHearing = task.hearings[task.hearings.length - 1];
          return `**Latest Hearing Update:**\n\nDate: ${new Date(
            lastHearing.date
          ).toLocaleDateString()}\nDetails: ${
            lastHearing.description || "No specific details recorded"
          }\nOutcome: ${
            lastHearing.inFavour ? "In Favour ✓" : "Not in Favour ✗"
          }\n\nTotal hearings conducted: ${
            task.hearings.length
          }\nFavourable outcomes: ${
            task.hearings.filter((h) => h.inFavour).length
          }`;
        } else {
          return "No hearings have been recorded for this case yet. You can add hearing updates through the case management interface.";
        }
      }

      // Check if it's about IPC/law
      if (
        userMessage.toLowerCase().includes("ipc") ||
        userMessage.toLowerCase().includes("section")
      ) {
        if (userMessage.toLowerCase().includes("suicide")) {
          return `**IPC Sections Related to Suicide:**\n\n**Section 306 IPC - Abetment of Suicide:**\nPunishes anyone who abets the commission of suicide. Punishment: Up to 10 years imprisonment and fine.\n\n**Section 309 IPC - Attempt to Commit Suicide:**\nPunishes attempts to commit suicide. However, this has been decriminalized in many contexts, especially under the Mental Healthcare Act, 2017.\n\n**Section 305 IPC - Abetment of Suicide by Minor/Insane Person:**\nIf a minor or person of unsound mind commits suicide, the abettor can be punished with death or life imprisonment.\n\nWould you like more details about any specific section?`;
        }
      }

      return "I apologize, but I'm having trouble generating a complete response. Could you please rephrase your question or ask something specific about:\n\n• This case's hearings and progress\n• Specific IPC sections or legal concepts\n• Case strategies or next steps\n• Legal procedures in Indian courts";
    }

    return text;
  } catch (error) {
    console.error("Error in AI chat:", error.message);

    if (error.message.includes("SAFETY")) {
      return "I cannot respond to that query. Please keep questions professional and related to legal matters.";
    }

    if (error.message.includes("RECITATION")) {
      return "I need to rephrase that response. Could you ask your question in a different way?";
    }

    return "I'm having trouble processing that request. Please try:\n\n• Being more specific about what you'd like to know\n• Asking about case details, hearings, or legal concepts\n• Rephrasing your question\n\nHow can I assist you with this case?";
  }
};

/**
 * Validate if question is about the current case
 */
export const isQuestionRelevant = async (question, caseTitle) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze if this question should be BLOCKED:

Question: "${question}"
Current Case: "${caseTitle}"

Respond with "NO" ONLY if the question is clearly:
- Asking for details about OTHER specific cases in the database
- Trying to access information about different case files
- Requesting sensitive data from other cases

Respond with "YES" if the question is:
- About this current case
- General legal questions (law, procedures, concepts, IPC sections)
- Legal terminology or advice
- Case strategies
- Public precedents or famous cases
- Any legitimate legal query

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
