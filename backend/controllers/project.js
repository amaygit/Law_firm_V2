import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const {
      title,
      name, // ✅ NEW: Case Name
      description,
      status,
      startDate,
      dueDate,
      members,
      tags,
      assignees,
      clients,
    } = req.body;

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

    const creatorId = req.user._id.toString();
    const finalMembers = members || [];

    const creatorExists = finalMembers.some(
      (member) => member.user === creatorId
    );

    if (!creatorExists) {
      finalMembers.push({
        user: creatorId,
        role: "manager",
      });
    }

    const finalAssignees = assignees || [];
    if (!finalAssignees.includes(creatorId)) {
      finalAssignees.push(creatorId);
    }

    const newProject = await Project.create({
      title,
      name, // ✅ NEW
      description,
      status,
      startDate,
      dueDate,
      members: finalMembers,
      assignees: finalAssignees,
      clients: clients || [],
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

    const project = await Project.findById(projectId)
      .populate("assignees", "name profilePicture")
      .populate("clients", "name profilePicture");

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
    const project = await Project.findById(projectId)
      .populate("members.user")
      .populate("assignees", "name profilePicture")
      .populate("clients", "name profilePicture");

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
      .populate("clients", "name profilePicture")
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

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Workspace.findByIdAndUpdate(project.workspace, {
      $pull: { projects: project._id },
    });

    await Task.deleteMany({ project: projectId });

    await project.deleteOne();

    return res.status(200).json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ NEW: Update project name
const updateProjectName = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Case name is required" });
    }

    if (name.length > 80) {
      return res
        .status(400)
        .json({ message: "Case name must be 80 characters or less" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    project.name = name;
    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createProject,
  getProjectDetails,
  getProjectTasks,
  deleteProject,
  updateProjectName,
};
