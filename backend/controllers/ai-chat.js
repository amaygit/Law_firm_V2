// // backend/controllers/ai-chat.js
// import Task from "../models/task.js";
// import {
//   generateCaseSummary,
//   searchSimilarCases,
//   chatWithCaseAI,
//   isQuestionRelevant,
// } from "../libs/gemini-ai.js";

// /**
//  * Initialize AI chat for a case - Get summary and similar cases
//  */
// export const initializeCaseAI = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.user._id;

//     // Get task and verify access
//     const task = await Task.findById(taskId)
//       .populate("assignees", "name email")
//       .populate("clients", "name email");

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Case not found",
//       });
//     }

//     // Check if user has access to this task
//     const hasAccess =
//       task.createdBy.toString() === userId.toString() ||
//       task.assignees.some((a) => a._id.toString() === userId.toString()) ||
//       task.clients.some((c) => c._id.toString() === userId.toString());

//     if (!hasAccess) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized access to this case",
//       });
//     }

//     console.log(`🤖 Initializing AI for case: ${task.title}`);

//     // Generate summary and search similar cases in parallel
//     const [summary, similarCases] = await Promise.all([
//       generateCaseSummary(task),
//       searchSimilarCases(task.title, task.courtName, task.description),
//     ]);

//     res.json({
//       success: true,
//       summary,
//       similarCases,
//       caseTitle: task.title,
//       caseId: task._id,
//     });
//   } catch (error) {
//     console.error("Error initializing case AI:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to initialize AI assistant",
//     });
//   }
// };

// /**
//  * Chat with AI about a specific case
//  */
// export const chatWithCase = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { message, chatHistory } = req.body;
//     const userId = req.user._id;

//     if (!message || !message.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });
//     }

//     // Get task and verify access
//     const task = await Task.findById(taskId)
//       .populate("assignees", "name")
//       .populate("clients", "name");

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Case not found",
//       });
//     }

//     // Check access
//     const hasAccess =
//       task.createdBy.toString() === userId.toString() ||
//       task.assignees.some((a) => a._id.toString() === userId.toString()) ||
//       task.clients.some((c) => c._id.toString() === userId.toString());

//     if (!hasAccess) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     // Validate question relevance (security check)
//     const isRelevant = await isQuestionRelevant(message, task.title);

//     if (!isRelevant) {
//       return res.json({
//         success: true,
//         response: `I can only discuss details about the current case: "${task.title}". I cannot provide information about other cases in the database.

// However, I can help you with:
// - Details about THIS case's hearings and progress
// - Legal advice related to THIS case type
// - Next steps and strategies for THIS case
// - General legal information and precedents

// How can I assist you with THIS case?`,
//       });
//     }

//     console.log(
//       `💬 AI Chat for case "${task.title}": ${message.substring(0, 50)}...`
//     );

//     // Get AI response
//     const aiResponse = await chatWithCaseAI(task, message, chatHistory || []);

//     res.json({
//       success: true,
//       response: aiResponse,
//     });
//   } catch (error) {
//     console.error("Error in AI chat:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to process your question",
//     });
//   }
// };

// /**
//  * Analyze case and provide insights
//  */
// export const analyzeCaseStrength = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.user._id;

//     const task = await Task.findById(taskId);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Case not found",
//       });
//     }

//     // Check access
//     const hasAccess =
//       task.createdBy.toString() === userId.toString() ||
//       task.assignees.some((a) => a._id.toString() === userId.toString());

//     if (!hasAccess) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     // Calculate case strength based on hearings
//     const totalHearings = task.hearings?.length || 0;
//     const favourableHearings =
//       task.hearings?.filter((h) => h.inFavour).length || 0;
//     const strengthPercentage =
//       totalHearings > 0
//         ? Math.round((favourableHearings / totalHearings) * 100)
//         : 0;

//     res.json({
//       success: true,
//       analysis: {
//         totalHearings,
//         favourableHearings,
//         strengthPercentage,
//         status: task.status,
//         priority: task.priority,
//         completedSubtasks:
//           task.subtasks?.filter((s) => s.completed).length || 0,
//         totalSubtasks: task.subtasks?.length || 0,
//       },
//     });
//   } catch (error) {
//     console.error("Error analyzing case:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to analyze case",
//     });
//   }
// };
// backend/controllers/ai-chat.js
import Task from "../models/task.js";
import Comment from "../models/comment.js";
import {
  generateCaseSummary,
  searchSimilarCases,
  chatWithCaseAI,
  isQuestionRelevant,
} from "../libs/gemini-ai.js";

/**
 * ✅ FIX: Initialize AI chat - Include comments in context
 */
export const initializeCaseAI = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Get task with comments
    const task = await Task.findById(taskId)
      .populate("assignees", "name email")
      .populate("clients", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check access
    const hasAccess =
      task.createdBy.toString() === userId.toString() ||
      task.assignees.some((a) => a._id.toString() === userId.toString()) ||
      task.clients.some((c) => c._id.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this case",
      });
    }

    console.log(`🤖 Initializing AI for case: ${task.title}`);

    // ✅ FIX: Fetch comments and add to task object
    const comments = await Comment.find({ resource: taskId })
      .populate("user", "name")
      .sort({ createdAt: 1 })
      .limit(20); // Include recent comments

    // Add comments to task object for AI context
    task.comments = comments;

    // Generate summary and search similar cases in parallel
    const [summary, similarCases] = await Promise.all([
      generateCaseSummary(task),
      searchSimilarCases(task.title, task.courtName, task.description),
    ]);

    res.json({
      success: true,
      summary,
      similarCases,
      caseTitle: task.title,
      caseId: task._id,
    });
  } catch (error) {
    console.error("Error initializing case AI:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize AI assistant",
    });
  }
};

/**
 * ✅ FIX: Chat with AI - Include comments in context
 */
export const chatWithCase = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message, chatHistory } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Get task with comments
    const task = await Task.findById(taskId)
      .populate("assignees", "name")
      .populate("clients", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check access
    const hasAccess =
      task.createdBy.toString() === userId.toString() ||
      task.assignees.some((a) => a._id.toString() === userId.toString()) ||
      task.clients.some((c) => c._id.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ FIX: Fetch comments and add to task
    const comments = await Comment.find({ resource: taskId })
      .populate("user", "name")
      .sort({ createdAt: 1 })
      .limit(20);

    task.comments = comments;

    // ✅ FIX: More lenient validation - allow general law questions
    const isRelevant = await isQuestionRelevant(message, task.title);

    if (!isRelevant) {
      return res.json({
        success: true,
        response: `I can only discuss details about the current case: "${task.title}". I cannot provide information about other cases in the database. 

However, I can help you with:
- Details about THIS case's hearings, comments, and progress
- General legal advice and Indian law concepts
- Legal strategies for THIS case type
- Public precedents and famous cases
- Legal terminology and procedures

How can I assist you with THIS case or general legal matters?`,
      });
    }

    console.log(
      `💬 AI Chat for case "${task.title}": ${message.substring(0, 50)}...`
    );

    // Get AI response
    const aiResponse = await chatWithCaseAI(task, message, chatHistory || []);

    res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process your question",
    });
  }
};

/**
 * Analyze case and provide insights
 */
export const analyzeCaseStrength = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check access
    const hasAccess =
      task.createdBy.toString() === userId.toString() ||
      task.assignees.some((a) => a._id.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Calculate case strength based on hearings
    const totalHearings = task.hearings?.length || 0;
    const favourableHearings =
      task.hearings?.filter((h) => h.inFavour).length || 0;
    const strengthPercentage =
      totalHearings > 0
        ? Math.round((favourableHearings / totalHearings) * 100)
        : 0;

    res.json({
      success: true,
      analysis: {
        totalHearings,
        favourableHearings,
        strengthPercentage,
        status: task.status,
        priority: task.priority,
        completedSubtasks:
          task.subtasks?.filter((s) => s.completed).length || 0,
        totalSubtasks: task.subtasks?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error analyzing case:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze case",
    });
  }
};
