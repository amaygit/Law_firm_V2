// backend/controllers/googleDriveFiles.js
import Task from "../models/task.js";
import User from "../models/user.js";
import Project from "../models/project.js";
import { encrypt, decrypt } from "../libs/encryption.js";
import {
  createDriveClient,
  uploadFileToDrive,
  deleteFileFromDrive,
  calculateUserStorage,
} from "../services/googleDrive.js";
import { getValidTokens } from "./googleAuth.js";
import { recordActivity } from "../libs/index.js";

/**
 * Upload file to user's Google Drive
 */
export const uploadFileToGoogleDrive = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    // Check if user has Google Drive connected
    const user = await User.findById(userId).select(
      "googleDrive.connected googleDrive.email"
    );
    if (!user?.googleDrive?.connected) {
      return res.status(400).json({
        success: false,
        message: "Please connect your Google Drive first",
        requiresGoogleAuth: true,
      });
    }

    // Get the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Check permissions
    const project = await Project.findById(task.project);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const isAssignee = task.assignees.some(
      (a) => a.toString() === userId.toString()
    );
    const isProjectMember = project.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (!isAssignee && !isProjectMember) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to upload files" });
    }

    // Get valid tokens and create Drive client
    const tokens = await getValidTokens(userId);
    const drive = createDriveClient(tokens);

    // Upload file to Google Drive
    const driveFile = await uploadFileToDrive(drive, file, taskId);

    // Create encrypted attachment record
    const attachment = {
      fileName: file.originalname,
      fileUrl: encrypt(driveFile.webViewLink),
      driveFileId: encrypt(driveFile.id),
      fileType: file.mimetype,
      fileSize: parseInt(driveFile.size || file.size),
      uploadedBy: userId,
      uploaderEmail: user.googleDrive.email,
      uploadedAt: new Date(),
      driveOwnerId: userId,
    };

    task.attachments.push(attachment);
    await task.save();

    // Update user's storage calculation
    const totalStorage = await calculateUserStorage(drive);
    await User.findByIdAndUpdate(userId, {
      "storageUsed.bytes": totalStorage,
      "storageUsed.lastCalculated": new Date(),
    });

    // Record activity
    await recordActivity(userId, "added_attachment", "Task", taskId, {
      description: `uploaded file ${file.originalname}`,
    });

    res.json({
      success: true,
      message: "File uploaded successfully",
      attachment: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: attachment.fileSize,
        uploadedBy: userId,
        uploaderEmail: user.googleDrive.email,
      },
    });
  } catch (error) {
    console.error("Google Drive upload error:", error);

    if (error.message === "Google Drive not connected") {
      return res.status(400).json({
        success: false,
        message: "Please connect your Google Drive first",
        requiresGoogleAuth: true,
      });
    }

    res.status(500).json({ success: false, message: "Failed to upload file" });
  }
};

/**
 * Get all files for a task (decrypted for display)
 */
export const getTaskFiles = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId)
      .populate("attachments.uploadedBy", "name profilePicture")
      .populate("attachments.driveOwnerId", "name");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.project);
    const hasAccess =
      task.assignees.some((a) => a.toString() === userId.toString()) ||
      task.clients.some((c) => c.toString() === userId.toString()) ||
      project?.members.some((m) => m.user.toString() === userId.toString());

    if (!hasAccess) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Decrypt file URLs for response
    const files = task.attachments.map((att) => ({
      _id: att._id,
      fileName: att.fileName,
      fileUrl: decrypt(att.fileUrl), // Decrypted for viewing
      fileType: att.fileType,
      fileSize: att.fileSize,
      uploadedBy: att.uploadedBy,
      uploaderEmail: att.uploaderEmail,
      uploadedAt: att.uploadedAt,
      canDelete:
        att.uploadedBy?._id?.toString() === userId.toString() ||
        att.driveOwnerId?._id?.toString() === userId.toString() ||
        task.assignees.some((a) => a.toString() === userId.toString()),
    }));

    res.json({ success: true, files });
  } catch (error) {
    console.error("Error getting task files:", error);
    res.status(500).json({ success: false, message: "Failed to get files" });
  }
};

/**
 * Delete file from Google Drive and database
 */
export const deleteTaskFile = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Find the attachment
    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // Check if user can delete (assignee or file owner)
    const isAssignee = task.assignees.some(
      (a) => a.toString() === userId.toString()
    );
    const isFileOwner =
      attachment.driveOwnerId?.toString() === userId.toString();
    const isUploader = attachment.uploadedBy?.toString() === userId.toString();

    if (!isAssignee && !isFileOwner && !isUploader) {
      return res.status(403).json({
        success: false,
        message: "Only assignees can delete files",
      });
    }

    // Get the Drive owner's tokens to delete from their Drive
    const driveOwnerId = attachment.driveOwnerId;

    try {
      const tokens = await getValidTokens(driveOwnerId);
      const drive = createDriveClient(tokens);
      const driveFileId = decrypt(attachment.driveFileId);

      // Delete from Google Drive
      await deleteFileFromDrive(drive, driveFileId);

      // Update storage for Drive owner
      const totalStorage = await calculateUserStorage(drive);
      await User.findByIdAndUpdate(driveOwnerId, {
        "storageUsed.bytes": totalStorage,
        "storageUsed.lastCalculated": new Date(),
      });
    } catch (driveError) {
      console.error("Error deleting from Drive:", driveError);
      // Continue to remove from database even if Drive deletion fails
    }

    // Remove from database
    task.attachments.pull(attachmentId);
    await task.save();

    // Record activity
    await recordActivity(userId, "removed_attachment", "Task", taskId, {
      description: `deleted file ${attachment.fileName}`,
    });

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, message: "Failed to delete file" });
  }
};

/**
 * Get user's storage usage across all their uploaded files
 */
export const getUserStorageUsage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "storageUsed googleDrive.connected"
    );

    if (!user?.googleDrive?.connected) {
      return res.json({
        success: true,
        usage: {
          totalSizeBytes: 0,
          totalSizeMB: 0,
          totalSizeGB: 0,
          totalFiles: 0,
          connected: false,
        },
      });
    }

    // Get fresh storage calculation if last calculation was > 5 mins ago
    let storageBytes = user.storageUsed?.bytes || 0;
    const lastCalc = user.storageUsed?.lastCalculated;
    const needsRefresh =
      !lastCalc || Date.now() - new Date(lastCalc).getTime() > 5 * 60 * 1000;

    if (needsRefresh) {
      try {
        const tokens = await getValidTokens(userId);
        const drive = createDriveClient(tokens);
        storageBytes = await calculateUserStorage(drive);

        await User.findByIdAndUpdate(userId, {
          "storageUsed.bytes": storageBytes,
          "storageUsed.lastCalculated": new Date(),
        });
      } catch (e) {
        console.error("Storage refresh error:", e);
      }
    }

    // Count total files uploaded by user
    const fileCount = await Task.aggregate([
      { $unwind: "$attachments" },
      { $match: { "attachments.driveOwnerId": userId } },
      { $count: "total" },
    ]);

    const totalFiles = fileCount[0]?.total || 0;
    const totalSizeMB = storageBytes / (1024 * 1024);
    const totalSizeGB = totalSizeMB / 1024;

    res.json({
      success: true,
      usage: {
        totalSizeBytes: storageBytes,
        totalSizeMB: Math.round(totalSizeMB * 100) / 100,
        totalSizeGB: Math.round(totalSizeGB * 1000) / 1000,
        totalFiles,
        connected: true,
      },
    });
  } catch (error) {
    console.error("Error getting storage usage:", error);
    res.status(500).json({ success: false, message: "Failed to get storage" });
  }
};
