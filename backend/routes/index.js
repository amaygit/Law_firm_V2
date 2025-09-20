// routes/index.js
import express from "express";

import authRoutes from "./auth.js";
import workspaceRoutes from "./workspace.js";
import projectRoutes from "./project.js";
import taskRoutes from "./task.js";
import userRoutes from "./user.js";
import aiRoutes from "./ai.js"; // 👈 Import AI Routes here
import storageRoutes from "./storage.js";
import eventRoutes from "./event.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes); // 👈 Mount AI route here => /api-v1/ai/ask
router.use("/storage", storageRoutes);
router.use("/events", eventRoutes);

export default router;
