import express from "express";
import {
  getStorageUsage,
  checkStorageLimit,
  recordFileUpload,
} from "../controllers/storage.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/usage", authMiddleware, getStorageUsage);
router.post("/check-limit", authMiddleware, checkStorageLimit);
router.post("/record/:taskId", authMiddleware, recordFileUpload);

export default router;
