import express from "express";
import { askLawAI, deleteChatHistory, getChatHistory } from "../controllers/ai.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/ask", authMiddleware, askLawAI);
router.get("/history", authMiddleware, getChatHistory);
router.delete("/history", authMiddleware, deleteChatHistory);

export default router;
