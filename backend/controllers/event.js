import Event from "../models/event.js";
import {
  scheduleEmailReminder,
  cancelScheduledEmail,
  sendTestEmail,
} from "../libs/email-scheduler.js";

// Create event with email reminder
export const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

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
    });

    // Schedule email reminder
    try {
      const jobId = await scheduleEmailReminder(newEvent, userEmail);
      newEvent.reminderJobId = jobId;
      await newEvent.save();
    } catch (scheduleError) {
      console.error("Failed to schedule email:", scheduleError);
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully with email reminder",
      event: newEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, dateTime } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership
    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Cancel existing scheduled email
    if (event.reminderJobId) {
      cancelScheduledEmail(event.reminderJobId);
    }

    // Update event fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;

    if (dateTime) {
      const newEventDate = new Date(dateTime);
      if (newEventDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Event date must be in the future",
        });
      }
      event.dateTime = newEventDate;
    }

    await event.save();

    // Reschedule email
    try {
      const jobId = await scheduleEmailReminder(event, userEmail);
      event.reminderJobId = jobId;
      await event.save();
    } catch (scheduleError) {
      console.error("Failed to reschedule email:", scheduleError);
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership
    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Cancel scheduled email
    if (event.reminderJobId) {
      cancelScheduledEmail(event.reminderJobId);
    }

    await Event.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's events
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.find({ createdBy: userId })
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "name email");

    const total = await Event.countDocuments({ createdBy: userId });

    res.json({
      success: true,
      events,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting user events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Test email endpoint
export const testEmail = async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log("📧 Testing email functionality...");

    const result = await sendTestEmail(userEmail);

    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${userEmail}`,
        details: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
