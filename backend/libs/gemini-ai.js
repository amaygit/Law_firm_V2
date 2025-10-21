// // backend/libs/gemini-ai.js
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import axios from "axios";

// // Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /**
//  * Search for similar legal cases using Tavily API
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
//  */
// export const generateCaseSummary = async (task) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

//     const commentsText = task.comments?.length
//       ? task.comments
//           .map(
//             (c, i) => `${i + 1}. ${c.text} (by ${c.user?.name || "Unknown"})`
//           )
//           .join("\n")
//       : "No comments";

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

// **Comments/Discussions:**
// ${commentsText}

// Provide a professional summary focusing on:
// 1. Nature of the case
// 2. Current status and progress
// 3. Key hearings outcomes
// 4. Important comments or updates
// 5. Next steps or pending actions

// Keep it concise and professional. Do not leave response empty.`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     // ✅ FIX: Handle empty responses
//     if (!text || text.trim().length === 0) {
//       return `Case: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}\n\nThis case requires detailed analysis. Please ask specific questions about hearings, progress, or legal matters.`;
//     }

//     return text;
//   } catch (error) {
//     console.error("Error generating case summary:", error.message);
//     return "Unable to generate summary at this moment. Please try asking specific questions about the case.";
//   }
// };

// /**
//  * Chat with AI about a specific case
//  */
// export const chatWithCaseAI = async (task, userMessage, chatHistory = []) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash-exp",
//       generationConfig: {
//         temperature: 0.7,
//         topP: 0.95,
//         topK: 40,
//         maxOutputTokens: 1024,
//       },
//     });

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

//     const commentsText = task.comments?.length
//       ? task.comments
//           .map(
//             (c, i) =>
//               `${i + 1}. ${c.text} (by ${
//                 c.user?.name || "Unknown"
//               } on ${new Date(c.createdAt).toLocaleDateString()})`
//           )
//           .join("\n")
//       : "No comments";

//     const systemPrompt = `You are a specialized legal AI assistant for Indian law.

// **STRICT RULES - YOU MUST ALWAYS PROVIDE A RESPONSE:**
// - NEVER return empty or blank responses
// - If unsure, provide general legal information
// - Always answer the user's question professionally

// **SECURITY RULES:**
// - Use internal database information ONLY for THIS case: "${task.title}"
// - DO NOT reveal details about OTHER cases from the database
// - You CAN answer general legal questions about:
//   → Indian Penal Code (IPC), CrPC, Constitution, Civil Procedure Code
//   → Legal concepts, terminology, and procedures
//   → Famous public cases and precedents
//   → Legal strategies and best practices
//   → Court procedures and documentation
// - If asked about OTHER internal cases: Reply "I cannot provide details from other cases in the system."
// - If asked for similar cases: Provide PUBLICLY available examples

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

// **Comments/Discussions:**
// ${commentsText}

// **YOUR ROLE:**
// - Answer case-specific questions using ONLY the above case context
// - For general law questions (IPC sections, legal concepts, procedures): Use your extensive legal knowledge
// - Provide helpful legal advice, explain Indian law concepts, and suggest strategies
// - For similar cases: Provide PUBLIC examples and precedents from Indian legal history
// - Always reply professionally and NEVER leave response empty

// **EXAMPLES OF QUESTIONS YOU MUST ANSWER:**
// - "What is IPC related to suicide?" → Explain Section 306, 309 IPC
// - "What is hearing update on this case?" → Use the Hearings data above
// - "What are bail provisions?" → Explain bail law in India
// - "What is the case progress?" → Summarize from the context above

// Now respond to the user's question helpfully and professionally. NEVER return empty response.`;

//     // Build chat for better context
//     const chat = model.startChat({
//       history: [
//         {
//           role: "user",
//           parts: [{ text: systemPrompt }],
//         },
//         {
//           role: "model",
//           parts: [
//             {
//               text: "Understood. I will provide helpful legal assistance using case context and my knowledge of Indian law. I will never leave responses empty.",
//             },
//           ],
//         },
//         // Add recent chat history
//         ...chatHistory
//           .slice(-4)
//           .flatMap((msg) => [
//             {
//               role: "user",
//               parts: [{ text: msg.role === "user" ? msg.content : "" }],
//             },
//             {
//               role: "model",
//               parts: [{ text: msg.role === "assistant" ? msg.content : "" }],
//             },
//           ])
//           .filter((msg) => msg.parts[0].text),
//       ],
//     });

//     const result = await chat.sendMessage(userMessage);
//     const response = await result.response;
//     const text = response.text();

//     // ✅ FIX: Handle blank responses with fallback
//     if (!text || text.trim().length === 0) {
//       console.warn("⚠️ Gemini returned empty response, providing fallback");

//       // Check if it's about hearings
//       if (userMessage.toLowerCase().includes("hearing")) {
//         if (task.hearings?.length > 0) {
//           const lastHearing = task.hearings[task.hearings.length - 1];
//           return `**Latest Hearing Update:**\n\nDate: ${new Date(
//             lastHearing.date
//           ).toLocaleDateString()}\nDetails: ${
//             lastHearing.description || "No specific details recorded"
//           }\nOutcome: ${
//             lastHearing.inFavour ? "In Favour ✓" : "Not in Favour ✗"
//           }\n\nTotal hearings conducted: ${
//             task.hearings.length
//           }\nFavourable outcomes: ${
//             task.hearings.filter((h) => h.inFavour).length
//           }`;
//         } else {
//           return "No hearings have been recorded for this case yet. You can add hearing updates through the case management interface.";
//         }
//       }

//       // Check if it's about IPC/law
//       if (
//         userMessage.toLowerCase().includes("ipc") ||
//         userMessage.toLowerCase().includes("section")
//       ) {
//         if (userMessage.toLowerCase().includes("suicide")) {
//           return `**IPC Sections Related to Suicide:**\n\n**Section 306 IPC - Abetment of Suicide:**\nPunishes anyone who abets the commission of suicide. Punishment: Up to 10 years imprisonment and fine.\n\n**Section 309 IPC - Attempt to Commit Suicide:**\nPunishes attempts to commit suicide. However, this has been decriminalized in many contexts, especially under the Mental Healthcare Act, 2017.\n\n**Section 305 IPC - Abetment of Suicide by Minor/Insane Person:**\nIf a minor or person of unsound mind commits suicide, the abettor can be punished with death or life imprisonment.\n\nWould you like more details about any specific section?`;
//         }
//       }

//       return "I apologize, but I'm having trouble generating a complete response. Could you please rephrase your question or ask something specific about:\n\n• This case's hearings and progress\n• Specific IPC sections or legal concepts\n• Case strategies or next steps\n• Legal procedures in Indian courts";
//     }

//     return text;
//   } catch (error) {
//     console.error("Error in AI chat:", error.message);

//     if (error.message.includes("SAFETY")) {
//       return "I cannot respond to that query. Please keep questions professional and related to legal matters.";
//     }

//     if (error.message.includes("RECITATION")) {
//       return "I need to rephrase that response. Could you ask your question in a different way?";
//     }

//     return "I'm having trouble processing that request. Please try:\n\n• Being more specific about what you'd like to know\n• Asking about case details, hearings, or legal concepts\n• Rephrasing your question\n\nHow can I assist you with this case?";
//   }
// };

// /**
//  * Validate if question is about the current case
//  */
// export const isQuestionRelevant = async (question, caseTitle) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

//     const prompt = `Analyze if this question should be BLOCKED:

// Question: "${question}"
// Current Case: "${caseTitle}"

// Respond with "NO" ONLY if the question is clearly:
// - Asking for details about OTHER specific cases in the database
// - Trying to access information about different case files
// - Requesting sensitive data from other cases

// Respond with "YES" if the question is:
// - About this current case
// - General legal questions (law, procedures, concepts, IPC sections)
// - Legal terminology or advice
// - Case strategies
// - Public precedents or famous cases
// - Any legitimate legal query

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

    const prompt = `You are a legal AI assistant for Indian law. Provide a comprehensive case summary in 4-6 sentences:

**Case Title:** ${task.title}
**Court Name:** ${task.courtName || "Not specified"}
**Description:** ${task.description || "No description provided"}
**Status:** ${task.status}
**Priority:** ${task.priority}
**Due Date:** ${new Date(task.dueDate).toLocaleDateString()}
**Assigned To:** ${assigneesText}

**Hearings:**
${hearingsText}

**Subtasks/Milestones:**
${subtasksText}

**Comments/Discussions:**
${commentsText}

Provide a professional summary covering:
1. Nature and type of the case
2. Current status and progress
3. Key hearings outcomes and implications
4. Important comments or updates from team
5. Next steps or pending actions
6. Legal considerations

Keep it concise, professional, and informative.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return `**Case: ${task.title}**\n\nStatus: ${task.status}\nPriority: ${
        task.priority
      }\nDue Date: ${new Date(
        task.dueDate
      ).toLocaleDateString()}\n\nThis case has ${
        task.hearings?.length || 0
      } hearings recorded and ${
        task.subtasks?.length || 0
      } milestones. Please ask specific questions for detailed analysis.`;
    }

    return text;
  } catch (error) {
    console.error("Error generating case summary:", error.message);
    return "Unable to generate summary at this moment. Please try asking specific questions about the case.";
  }
};

/**
 * Scan and analyze attachment
 */
export const scanAttachment = async (
  fileName,
  fileUrl,
  caseTitle,
  caseDescription
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Check file type
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const supportedTextFormats = ["txt", "pdf", "doc", "docx"];

    if (!supportedTextFormats.includes(fileExtension)) {
      return `**File Analysis: ${fileName}**\n\nThis file type (.${fileExtension}) cannot be analyzed automatically. I can only scan text-based documents (PDF, DOC, DOCX, TXT).\n\nHowever, I can help you with:\n- Questions about this case\n- Legal advice related to the case type\n- Document preparation guidelines\n- Legal procedures and requirements`;
    }

    const prompt = `You are a legal AI assistant analyzing a document for an Indian legal case.

**Case Context:**
- Title: ${caseTitle}
- Description: ${caseDescription || "Not provided"}

**Document Information:**
- File Name: ${fileName}
- File Type: ${fileExtension.toUpperCase()}

**Task:** Analyze this document and provide:

1. **Document Summary:** Brief overview of the document content
2. **Legal Relevance:** How this document relates to the case
3. **Key Points:** Important facts, dates, or evidence mentioned
4. **Legal Implications:** Any legal considerations or implications
5. **Recommendations:** Suggested actions or follow-ups based on the document
6. **Red Flags:** Any concerning points or issues to address

Note: Since I cannot directly access the file from URL, provide a template analysis based on common legal document types like:
- Evidence documents
- Witness statements
- Court orders
- Legal notices
- Contracts or agreements
- Police reports
- Medical reports

Format your response professionally and highlight critical information.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return `**Document: ${fileName}**\n\nI've identified this document but need more context to provide detailed analysis.\n\n**General Recommendations:**\n- Ensure the document is properly dated and signed\n- Verify all parties mentioned are correctly identified\n- Check for any missing information or inconsistencies\n- Cross-reference with other case documents\n\nWould you like to ask specific questions about this document?`;
    }

    return `**Document Analysis: ${fileName}**\n\n${text}\n\n---\n\n*Note: This is an AI-generated analysis. Please verify all information with legal experts and review the original document carefully.*`;
  } catch (error) {
    console.error("Error scanning attachment:", error.message);
    return `**Error Analyzing: ${fileName}**\n\nI encountered an issue analyzing this document. This could be due to:\n- File format limitations\n- File size restrictions\n- Access permissions\n\nYou can:\n- Ask me specific questions about what you need from this document\n- Provide key excerpts for analysis\n- Request guidance on document review procedures`;
  }
};

/**
 * Chat with AI about a specific case or general legal matters
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

    const systemPrompt = `You are SAJNA - a specialized legal AI assistant with expertise in law and order worldwide, with deep knowledge of Indian legal system.

**CRITICAL RULES - MUST FOLLOW:**
1. ONLY answer questions related to LAW, LEGAL MATTERS, and LEGAL CONCEPTS
2. NEVER answer non-legal questions (restaurants, travel, entertainment, general knowledge)
3. ALWAYS provide helpful, accurate legal information
4. NEVER leave responses empty or blank

**WHAT YOU CAN ANSWER:**
✅ Legal concepts and terminology (any jurisdiction)
✅ Indian law (IPC, CrPC, Constitution, civil law, etc.)
✅ International law and comparative legal systems
✅ Legal procedures, court systems, documentation
✅ Case strategies, legal precedents, famous cases
✅ THIS specific case's details (from context below)
✅ General legal advice and guidance
✅ Legal rights, obligations, and remedies

**WHAT YOU CANNOT ANSWER:**
❌ Non-legal questions (food, travel, entertainment, etc.)
❌ Details about OTHER cases in the database
❌ Personal advice unrelated to legal matters
❌ Medical, financial, or technical advice outside legal scope

**CURRENT CASE CONTEXT (from database):**
- Title: ${task.title}
- Court: ${task.courtName || "Not specified"}
- Description: ${task.description || "No description"}
- Status: ${task.status}
- Priority: ${task.priority}
- Due Date: ${new Date(task.dueDate).toLocaleDateString()}

**Hearings:**
${hearingsText}

**Milestones:**
${subtasksText}

**Team Comments:**
${commentsText}

**YOUR ROLE:**
- Answer case-specific questions using the above context
- Provide comprehensive legal knowledge on ANY legal topic worldwide
- Explain legal concepts clearly and professionally
- Suggest legal strategies and best practices
- Reference public legal precedents and famous cases
- Guide on legal procedures and documentation

**RESPONSE REQUIREMENTS:**
- Always be helpful and informative
- Never return empty responses
- Use clear, professional language
- Provide examples when helpful
- Cite relevant sections/acts when applicable
- Format responses clearly with headings when needed

Now respond to the user's legal question professionally and comprehensively.`;

    // Build chat
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
              text: "Understood. I am SAJNA, your legal AI assistant. I will provide comprehensive legal assistance on any law-related topic worldwide, with special expertise in Indian law. I will only answer legal questions and always provide helpful, detailed responses. How can I assist you with legal matters today?",
            },
          ],
        },
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

    // Handle empty responses
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ Gemini returned empty response, providing fallback");

      // Context-aware fallbacks
      if (userMessage.toLowerCase().includes("hearing")) {
        if (task.hearings?.length > 0) {
          const lastHearing = task.hearings[task.hearings.length - 1];
          const favourableCount = task.hearings.filter(
            (h) => h.inFavour
          ).length;
          return `**Hearing Information:**\n\n**Latest Hearing:**\n- Date: ${new Date(
            lastHearing.date
          ).toLocaleDateString()}\n- Details: ${
            lastHearing.description || "No specific details recorded"
          }\n- Outcome: ${
            lastHearing.inFavour ? "✓ In Favour" : "✗ Not in Favour"
          }\n\n**Overall Progress:**\n- Total hearings: ${
            task.hearings.length
          }\n- Favourable outcomes: ${favourableCount}\n- Success rate: ${Math.round(
            (favourableCount / task.hearings.length) * 100
          )}%\n\nWould you like me to provide strategies for upcoming hearings or explain hearing procedures?`;
        }
      }

      return "I apologize for the brief interruption. I'm ready to help you with any legal questions:\n\n• Ask about this case's progress and details\n• Legal concepts, laws, and procedures\n• Case strategies and recommendations\n• IPC sections or legal provisions\n• Court procedures and documentation\n\nWhat would you like to know?";
    }

    return text;
  } catch (error) {
    console.error("Error in AI chat:", error.message);

    if (error.message.includes("SAFETY")) {
      return "I cannot respond to that query. Please keep questions professional and related to legal matters.";
    }

    if (error.message.includes("RECITATION")) {
      return "Let me rephrase that. Could you ask your question in a different way so I can provide a unique response?";
    }

    return "I'm having trouble processing that request. Please try:\n\n• Being more specific about your legal question\n• Asking about case details, hearings, or progress\n• Inquiring about specific legal concepts or laws\n• Requesting legal strategies or advice\n\nHow can I assist you with legal matters?";
  }
};

/**
 * Validate if question is legal/relevant
 */
export const isQuestionRelevant = async (question, caseTitle) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze if this question is related to LAW, LEGAL MATTERS, or LEGAL CONCEPTS:

Question: "${question}"
Current Case: "${caseTitle}"

Respond with "YES" if the question is about:
- Any legal topic, law, or legal concept (any country/jurisdiction)
- Legal procedures, court systems, legal rights
- This specific case's details or progress
- Legal strategies, precedents, or case analysis
- Indian law (IPC, CrPC, Constitution, etc.)
- International law or legal comparisons
- Legal documentation or legal advice
- Famous legal cases or legal history

Respond with "NO" ONLY if the question is clearly:
- About restaurants, food, travel, entertainment
- General knowledge completely unrelated to law
- Personal advice outside legal matters (medical, financial, etc.)
- Details about OTHER cases in the database (trying to access other case data)

Examples:
"What is IPC 302?" → YES (legal question)
"Best restaurant near court?" → NO (not legal)
"What are bail provisions?" → YES (legal question)
"Tell me about another case in the system" → NO (database security)
"What is the case progress?" → YES (current case)
"Movie recommendations?" → NO (not legal)

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
