import Event from "../models/event.js";
import {
  scheduleWhatsAppMessage,
  cancelScheduledMessage,
} from "../libs/whatsapp-scheduler.js";

// Create event (workspace independent)
export const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, phoneNumbers } = req.body;
    const userId = req.user._id;

    // ✅ Validation: Check phoneNumbers array
    if (
      !phoneNumbers ||
      !Array.isArray(phoneNumbers) ||
      phoneNumbers.length === 0
    ) {
      return res.status(400).json({
        message: "At least one phone number is required",
      });
    }

    if (phoneNumbers.length > 2) {
      return res.status(400).json({
        message: "Maximum 2 phone numbers allowed",
      });
    }

    // Validate date is in future
    const eventDate = new Date(dateTime);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        message: "Event date must be in the future",
      });
    }

    // Clean phone numbers
    const cleanedPhoneNumbers = phoneNumbers
      .map((phone) => phone.replace(/\D/g, ""))
      .filter((phone) => phone.length >= 10);

    if (cleanedPhoneNumbers.length === 0) {
      return res.status(400).json({
        message: "Please provide valid phone numbers",
      });
    }

    // Create event
    const newEvent = await Event.create({
      title,
      description,
      dateTime: eventDate,
      createdBy: userId,
      phoneNumbers: cleanedPhoneNumbers,
    });

    // Schedule WhatsApp messages
    try {
      const jobId = await scheduleWhatsAppMessage(newEvent);
      newEvent.reminderJobId = jobId;
      await newEvent.save();
    } catch (scheduleError) {
      console.error("Failed to schedule WhatsApp message:", scheduleError);
      // Event is created but notification scheduling failed
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
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

// Get user's events (no workspace restriction)
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

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, dateTime, phoneNumbers } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user owns this event
    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate phoneNumbers if provided
    if (phoneNumbers) {
      if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one phone number is required",
        });
      }

      if (phoneNumbers.length > 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum 2 phone numbers allowed",
        });
      }
    }

    // Cancel existing scheduled message
    if (event.reminderJobId) {
      cancelScheduledMessage(event.reminderJobId);
    }

    // Update event fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;

    if (phoneNumbers) {
      const cleanedPhoneNumbers = phoneNumbers
        .map((phone) => phone.replace(/\D/g, ""))
        .filter((phone) => phone.length >= 10);

      if (cleanedPhoneNumbers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid phone numbers",
        });
      }

      event.phoneNumbers = cleanedPhoneNumbers;
    }

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

    // Reschedule WhatsApp message
    try {
      const jobId = await scheduleWhatsAppMessage(event);
      event.reminderJobId = jobId;
      await event.save();
    } catch (scheduleError) {
      console.error("Failed to reschedule WhatsApp message:", scheduleError);
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

    // Check if user owns this event
    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Cancel scheduled message
    if (event.reminderJobId) {
      cancelScheduledMessage(event.reminderJobId);
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
