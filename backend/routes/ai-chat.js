// // backend/routes/ai-chat.js
// import express from "express";
// import {
//   initializeCaseAI,
//   chatWithCase,
//   analyzeCaseStrength,
// } from "../controllers/ai-chat.js";
// import authMiddleware from "../middleware/auth-middleware.js";

// const router = express.Router();

// // Initialize AI chat for a case (get summary + similar cases)
// router.get("/case/:taskId/initialize", authMiddleware, initializeCaseAI);

// // Chat with AI about a case
// router.post("/case/:taskId/chat", authMiddleware, chatWithCase);

// // Analyze case strength
// router.get("/case/:taskId/analyze", authMiddleware, analyzeCaseStrength);

// export default router;

// backend/routes/ai-chat.js
import express from "express";
import {
  getSimilarCases,
  getCaseSummary,
  scanTaskAttachment,
  chatWithCase,
  analyzeCaseStrength,
} from "../controllers/ai-chat.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// Get similar cases only (when user clicks the option)
router.get("/case/:taskId/similar-cases", authMiddleware, getSimilarCases);

// Generate case summary only (when user clicks the option)
router.get("/case/:taskId/summary", authMiddleware, getCaseSummary);

// Scan attachment (when user selects a file to scan)
router.post(
  "/case/:taskId/scan-attachment",
  authMiddleware,
  scanTaskAttachment
);

// Chat with AI about a case or general legal questions
router.post("/case/:taskId/chat", authMiddleware, chatWithCase);

// Analyze case strength
router.get("/case/:taskId/analyze", authMiddleware, analyzeCaseStrength);

export default router;
