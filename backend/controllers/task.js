import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import InternalComment from "../models/internalComments.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";

// backend/controllers/task.js - Add this function

import AWS from "aws-sdk"; // ✅ You'll need to install: npm install aws-sdk

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "eu-north-1",
});

export const deleteTaskFile = async (req, res) => {
  try {
    const { taskId, fileKey } = req.params;
    const userId = req.user._id;

    // Decode the file key
    const decodedFileKey = decodeURIComponent(fileKey);

    console.log(
      `Attempting to delete file: ${decodedFileKey} from task: ${taskId}`
    );

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Get the project and check permissions
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project
    const userMember = project.members.find(
      (member) => member.user.toString() === userId.toString()
    );

    if (!userMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete files from this task",
      });
    }

    // ✅ Check user role - clients (viewers) shouldn't be able to delete files
    if (userMember.role === "viewer") {
      // assuming "viewer" = client
      return res.status(403).json({
        success: false,
        message: "Clients are not authorized to delete files",
      });
    }

    // Find the attachment to delete
    const attachmentIndex = task.attachments.findIndex((attachment) => {
      const fileName = attachment.fileName;

      // Check different possible formats
      return (
        fileName === decodedFileKey ||
        fileName === fileKey ||
        `${taskId}$${fileName}` === decodedFileKey ||
        attachment.fileUrl.includes(decodedFileKey)
      );
    });

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "File not found in task attachments",
      });
    }

    const attachment = task.attachments[attachmentIndex];

    // ✅ Delete from S3 first
    try {
      const bucketName = process.env.S3_BUCKET_NAME; // You'll need to set this

      if (!bucketName) {
        throw new Error("S3_BUCKET_NAME not configured");
      }

      console.log(
        `Deleting from S3 bucket: ${bucketName}, key: ${decodedFileKey}`
      );

      const deleteParams = {
        Bucket: bucketName,
        Key: decodedFileKey,
      };

      const result = await s3.deleteObject(deleteParams).promise();
      console.log("S3 deletion result:", result);
    } catch (s3Error) {
      console.error("S3 deletion failed:", s3Error);
      // Continue with database deletion even if S3 fails
      // You might want to handle this differently based on your needs
    }

    // Remove the attachment from the task
    const deletedAttachment = task.attachments[attachmentIndex];
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    // ✅ Record activity
    try {
      await recordActivity(userId, "removed_attachment", "Task", taskId, {
        description: `removed file ${deletedAttachment.fileName}`,
      });
    } catch (activityError) {
      console.error("Failed to record activity:", activityError);
    }

    res.json({
      success: true,
      message: "File deleted successfully",
      deletedFile: {
        fileName: deletedAttachment.fileName,
        fileSize: deletedAttachment.fileSize,
      },
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      clients,
    } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const workspace = await Workspace.findById(project.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }
    const creatorId = req.user._id.toString();
    const finalAssignees = assignees || [];

    // Add creator to assignees if not already present
    if (!finalAssignees.includes(creatorId)) {
      finalAssignees.push(creatorId);
    }
    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees: finalAssignees,
      clients,
      project: projectId,
      workspace: project.workspace,
      createdBy: req.user._id,
    });

    project.tasks.push(newTask._id);
    await project.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignees", "name profilePicture")
      .populate("clients", "name profilePicture")
      .populate("watchers", "name profilePicture");

    if (!task) {
      return res.status(404).json({ message: "Case not found" });
    }

    const project = await Project.findById(task.project).populate(
      "members.user",
      "name profilePicture"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Figure out role
    let role = null;
    if (
      task.clients.some((c) => c._id.toString() === req.user._id.toString())
    ) {
      role = "client";
    } else if (
      task.assignees.some((a) => a._id.toString() === req.user._id.toString())
    ) {
      role = "subLawyer";
    } else if (project.owner.toString() === req.user._id.toString()) {
      role = "owner";
    }
    const favourPercentage = calculateFavourPercentage(task.hearings);
    res.status(200).json({
      task,
      project,
      role,
      favourPercentage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldTitle = task.title;

    task.title = title;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task title from ${oldTitle} to ${title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldDescription =
      task.description.substring(0, 50) +
      (task.description.length > 50 ? "..." : "");
    const newDescription =
      description.substring(0, 50) + (description.length > 50 ? "..." : "");

    task.description = description;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task description from ${oldDescription} to ${newDescription}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Case not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldStatus = task.status;
    task.status = status;

    // ✅ Fix missing workspace
    if (!task.workspace) {
      task.workspace = project.workspace;
    }

    await task.save();

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated case status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this case",
      });
    }

    const oldAssignees = task.assignees;

    task.assignees = assignees;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated case assignees from ${oldAssignees.length} to ${assignees.length}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateTaskClients = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { clients } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: { clients } }, // 👈 update clients
      { new: true }
    ).populate("clients");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this case",
      });
    }

    const oldPriority = task.priority;

    task.priority = priority;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated case priority from ${oldPriority} to ${priority}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const newSubTask = {
      title,
      completed: false,
    };

    task.subtasks.push(newSubTask);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
      description: `created case milestone ${title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const subTask = task.subtasks.find(
      (subTask) => subTask._id.toString() === subTaskId
    );

    if (!subTask) {
      return res.status(404).json({
        message: "Case milestone not found",
      });
    }

    subTask.completed = completed;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
      description: `updated case milestone ${subTask.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getActivityByResourceId = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const activity = await ActivityLog.find({ resourceId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this case",
      });
    }

    const newComment = await Comment.create({
      text,
      task: taskId,
      author: req.user._id,
    });

    task.comments.push(newComment._id);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "added_comment", "Task", taskId, {
      description: `added comment ${
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      }`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const watchTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this case",
      });
    }

    const isWatching = task.watchers.includes(req.user._id);

    if (!isWatching) {
      task.watchers.push(req.user._id);
    } else {
      task.watchers = task.watchers.filter(
        (watcher) => watcher.toString() !== req.user._id.toString()
      );
    }

    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${
        isWatching ? "stopped watching" : "started watching"
      } task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const achievedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this Case",
      });
    }
    const isAchieved = task.isArchived;

    task.isArchived = !isAchieved;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${isAchieved ? "unachieved" : "achieved"} task ${
        task.title
      }`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignees: req.user._id },
        { clients: req.user._id },
        { watchers: req.user._id }, // optional, only if you want watchers to see tasks too
      ],
    })
      .populate("project", "title workspace")
      .populate("assignees", "name profilePicture")
      .populate("clients", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateTaskCourtName = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { courtName } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { courtName },
      { new: true }
    ).populate("assignees clients watchers createdBy");

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update court name", error });
  }
};

const calculateFavourPercentage = (hearings) => {
  if (!hearings || hearings.length === 0) return 0;
  const favourCount = hearings.filter((h) => h.inFavour).length;
  return Math.round((favourCount / hearings.length) * 100);
};

export const addTaskHearing = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { date, description, inFavour } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.hearings.push({ date, description, inFavour });
    await task.save();

    // calculate favour percentage
    const favourPercentage = calculateFavourPercentage(task.hearings);

    res.status(200).json({
      task,
      favourPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add hearing", error });
  }
};
export const getInternalCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await InternalComment.find({ task: taskId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addInternalComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "case not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this case",
      });
    }

    const newComment = await InternalComment.create({
      text,
      task: taskId,
      author: req.user._id,
    });

    task.comments.push(newComment._id);
    await task.save();

    // record activity
    // await recordActivity(req.user._id, "added_comment", "Task", taskId, {
    //   description: `added comment ${
    //     text.substring(0, 50) + (text.length > 50 ? "..." : "")
    //   }`,
    // });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const addTaskAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { fileName, fileUrl, fileType, fileSize } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get workspace and owner
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check storage limit before adding
    const ownedWorkspaces = await Workspace.find({
      owner: workspace.owner,
    }).select("_id");
    const workspaceIds = ownedWorkspaces.map((ws) => ws._id);

    const storageUsage = await Task.aggregate([
      { $match: { workspace: { $in: workspaceIds } } },
      { $unwind: "$attachments" },
      {
        $group: {
          _id: workspace.owner,
          totalSizeBytes: { $sum: "$attachments.fileSize" },
        },
      },
    ]);

    const currentUsageBytes = storageUsage[0]?.totalSizeBytes || 0;
    const limitBytes = 2 * 1024 * 1024 * 1024; // 2GB

    if (currentUsageBytes + fileSize > limitBytes) {
      return res.status(413).json({
        message: "Storage limit exceeded for workspace owner",
      });
    }

    // Add attachment with workspace owner tracking
    const attachment = {
      fileName,
      fileUrl,
      fileType,
      fileSize,
      uploadedBy: req.user._id,
      workspaceOwner: workspace.owner, // Track who this counts against
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();

    res.json({ message: "File attached successfully", task });
  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ message: "Failed to add attachment" });
  }
};

export {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  //updateTaskClients,
  updateTaskPriority,
  addSubTask,
  updateSubTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  addComment,
  watchTask,
  achievedTask,
  getMyTasks,
};
