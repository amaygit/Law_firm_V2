// backend/routes/googleDrive.js
import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth-middleware.js";
import {
  getGoogleAuthUrl,
  googleAuthCallback,
  disconnectGoogleDrive,
  getGoogleDriveStatus,
} from "../controllers/googleAuth.js";
import {
  uploadFileToGoogleDrive,
  getTaskFiles,
  deleteTaskFile,
  getUserStorageUsage,
} from "../controllers/googleDriveFiles.js";

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

// ===== AUTH ROUTES =====
// Add to backend/routes/googleDrive.js temporarily

// Get Google OAuth URL (user needs to be logged in)
router.get("/auth/url", authMiddleware, getGoogleAuthUrl);

// OAuth callback (no auth middleware - user coming from Google)
router.get("/auth/callback", googleAuthCallback);

// Disconnect Google Drive
router.post("/auth/disconnect", authMiddleware, disconnectGoogleDrive);

// Get connection status
router.get("/auth/status", authMiddleware, getGoogleDriveStatus);

// ===== FILE ROUTES =====

// Upload file to Google Drive
router.post(
  "/upload/:taskId",
  authMiddleware,
  upload.single("file"),
  uploadFileToGoogleDrive
);

// Get files for a task
router.get("/files/:taskId", authMiddleware, getTaskFiles);

// Delete a file
router.delete("/files/:taskId/:attachmentId", authMiddleware, deleteTaskFile);

// Get user's storage usage
router.get("/storage", authMiddleware, getUserStorageUsage);

export default router;
