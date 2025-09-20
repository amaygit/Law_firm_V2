import Event from "../models/event.js";
import Workspace from "../models/workspace.js";
import cron from "node-cron";
import {
  scheduleWhatsAppMessage,
  cancelScheduledMessage,
} from "../libs/whatsapp-scheduler.js";

// Create event with WhatsApp scheduling
export const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, workspaceId, phoneNumber } = req.body;
    const userId = req.user._id;

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Validate date is in future
    const eventDate = new Date(dateTime);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        message: "Event date must be in the future",
      });
    }

    // Create event
    const newEvent = await Event.create({
      title,
      description,
      dateTime: eventDate,
      createdBy: userId,
      workspace: workspaceId,
      phoneNumber: phoneNumber.replace(/\D/g, ""), // Clean phone number
    });

    // Schedule WhatsApp message
    try {
      const jobId = await scheduleWhatsAppMessage(newEvent);
      newEvent.reminderJobId = jobId;
      await newEvent.save();
    } catch (scheduleError) {
      console.error("Failed to schedule WhatsApp message:", scheduleError);
      // Event is created but notification scheduling failed
    }

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get events for workspace
export const getEvents = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const events = await Event.find({ workspace: workspaceId })
      .populate("createdBy", "name email")
      .sort({ dateTime: 1 });

    res.json({ events });
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, dateTime, phoneNumber } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user created this event or is workspace member
    const workspace = await Workspace.findById(event.workspace);
    const isMember = workspace.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!isMember && event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Cancel existing scheduled message
    if (event.reminderJobId) {
      cancelScheduledMessage(event.reminderJobId);
    }

    // Update event
    event.title = title || event.title;
    event.description = description || event.description;
    event.phoneNumber = phoneNumber
      ? phoneNumber.replace(/\D/g, "")
      : event.phoneNumber;

    if (dateTime) {
      const newEventDate = new Date(dateTime);
      if (newEventDate <= new Date()) {
        return res.status(400).json({
          message: "Event date must be in the future",
        });
      }
      event.dateTime = newEventDate;
    }

    await event.save();

    // Reschedule WhatsApp message
    try {
      const jobId = await scheduleWhatsAppMessage(event);
      event.reminderJobId = jobId;
      await event.save();
    } catch (scheduleError) {
      console.error("Failed to reschedule WhatsApp message:", scheduleError);
    }

    res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user created this event
    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Cancel scheduled message
    if (event.reminderJobId) {
      cancelScheduledMessage(event.reminderJobId);
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's events
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const events = await Event.find({ createdBy: userId })
      .populate("workspace", "name")
      .sort({ dateTime: 1 });

    res.json({ events });
  } catch (error) {
    console.error("Error getting user events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
