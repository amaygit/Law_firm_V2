// backend/routes/ai-chat.js
import express from "express";
import {
  initializeCaseAI,
  chatWithCase,
  analyzeCaseStrength,
} from "../controllers/ai-chat.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// Initialize AI chat for a case (get summary + similar cases)
router.get("/case/:taskId/initialize", authMiddleware, initializeCaseAI);

// Chat with AI about a case
router.post("/case/:taskId/chat", authMiddleware, chatWithCase);

// Analyze case strength
router.get("/case/:taskId/analyze", authMiddleware, analyzeCaseStrength);

export default router;
