import Task from "../models/task.js";
import Workspace from "../models/workspace.js";

// Get storage usage for a workspace owner
export const getStorageUsage = async (req, res) => {
  try {
    const userId = req.user._id;

    // Method 1: Get from attachments with workspaceOwner field
    const tasks = await Task.find({
      "attachments.workspaceOwner": userId,
    });

    let totalSizeBytes = 0;
    let totalFiles = 0;

    tasks.forEach((task) => {
      if (task.attachments && task.attachments.length > 0) {
        task.attachments.forEach((attachment) => {
          // Only count attachments owned by this user
          if (
            attachment.workspaceOwner &&
            attachment.workspaceOwner.toString() === userId.toString()
          ) {
            totalSizeBytes += attachment.fileSize || 0;
            totalFiles += 1;
          }
        });
      }
    });

    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    const totalSizeGB = totalSizeMB / 1024;
    const limitGB = 2;
    const usagePercentage = Math.min(100, (totalSizeGB / limitGB) * 100);

    res.json({
      success: true,
      usage: {
        totalSizeBytes,
        totalSizeMB: Math.round(totalSizeMB * 100) / 100,
        totalSizeGB: Math.round(totalSizeGB * 100) / 100,
        totalFiles,
        limitGB,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        isOverLimit: totalSizeGB > limitGB,
      },
    });
  } catch (error) {
    console.error("Error getting storage usage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get storage usage",
    });
  }
};

// Check storage limit for workspace owner
export const checkStorageLimit = async (req, res) => {
  try {
    const { fileSize, taskId } = req.body;
    const userId = req.user._id;

    // Get the task and its workspace
    const task = await Task.findById(taskId).populate("workspace");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Get workspace owner
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const workspaceOwnerId = workspace.owner;

    // Check current usage for the workspace owner
    const tasks = await Task.find({
      "attachments.workspaceOwner": workspaceOwnerId,
    });

    let currentUsageBytes = 0;
    tasks.forEach((t) => {
      if (t.attachments) {
        t.attachments.forEach((att) => {
          if (
            att.workspaceOwner &&
            att.workspaceOwner.toString() === workspaceOwnerId.toString()
          ) {
            currentUsageBytes += att.fileSize || 0;
          }
        });
      }
    });

    const limitBytes = 2 * 1024 * 1024 * 1024; // 2GB
    const newTotalBytes = currentUsageBytes + fileSize;

    // Check if adding this file would exceed the limit
    if (newTotalBytes > limitBytes) {
      const availableBytes = limitBytes - currentUsageBytes;
      const availableMB = availableBytes / (1024 * 1024);

      return res.status(413).json({
        success: false,
        message: "Storage limit exceeded for workspace owner",
        availableBytes,
        availableMB: Math.round(availableMB * 100) / 100,
        requestedBytes: fileSize,
        requestedMB: Math.round((fileSize / (1024 * 1024)) * 100) / 100,
      });
    }

    // Also check individual file size limit
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxFileSize) {
      return res.status(413).json({
        success: false,
        message: "File too large. Maximum 50MB per file.",
      });
    }

    res.json({
      success: true,
      message: "Upload allowed",
      workspaceOwnerId: workspaceOwnerId, // 👈 Return this for frontend
    });
  } catch (error) {
    console.error("Error checking storage limit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check storage limit",
    });
  }
};

// Record file upload with workspace owner tracking
export const recordFileUpload = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { fileName, fileUrl, fileType, fileSize } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Get workspace and its owner
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Create attachment with workspace owner tracking
    const attachment = {
      fileName,
      fileUrl,
      fileType,
      fileSize: fileSize || 0,
      uploadedBy: req.user._id,
      workspaceOwner: workspace.owner, // 👈 Track workspace owner
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();

    res.json({
      success: true,
      message: "File recorded successfully",
      workspaceOwner: workspace.owner,
    });
  } catch (error) {
    console.error("Error recording file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record file",
    });
  }
};
