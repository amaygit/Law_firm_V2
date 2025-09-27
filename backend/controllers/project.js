import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, members, tags } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

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

    // ✅ NEW: Automatically add creator to members if not already included
    const creatorId = req.user._id.toString();
    const finalMembers = members || [];

    // Check if creator is already in the members list
    const creatorExists = finalMembers.some(
      (member) => member.user === creatorId
    );

    // Add creator as manager if not already present
    if (!creatorExists) {
      finalMembers.push({
        user: creatorId,
        role: "manager", // ✅ Auto-assign creator as manager
      });
    }

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      members: finalMembers, // ✅ Use the updated members array
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      workspace: workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
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

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check if requester is a member
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove project ref from workspace
    await Workspace.findByIdAndUpdate(project.workspace, {
      $pull: { projects: project._id },
    });

    // Delete all tasks inside the project
    await Task.deleteMany({ project: projectId });

    // Delete the project
    await project.deleteOne();

    return res.status(200).json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createProject, getProjectDetails, getProjectTasks, deleteProject };
