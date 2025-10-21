import axios from "axios";
import cron from "node-cron";
import Event from "../models/event.js";

// Store scheduled jobs in memory
const scheduledJobs = new Map();

/**
 * Send SMS via MoceanAPI (using Token authentication)
 * NOTE: MoceanAPI only sends to verified numbers
 * @param {string} message - SMS message text
 * @returns {Promise<Object>} - Result object
 */
export const sendSMSViaMocean = async (message) => {
  try {
    if (!process.env.MOCEAN_API_TOKEN) {
      throw new Error("MoceanAPI token not configured");
    }

    if (!process.env.MOCEAN_FROM) {
      throw new Error("MOCEAN_FROM (verified number) not configured");
    }

    // Clean phone number - remove + and spaces
    const cleanFrom = process.env.MOCEAN_FROM.replace(/[\+\s\-\(\)]/g, "");

    const url = "https://rest.moceanapi.com/rest/2/sms";

    // MoceanAPI with Token - using form data format
    const formData = new URLSearchParams({
      "mocean-api-key": process.env.MOCEAN_API_TOKEN,
      "mocean-from": cleanFrom,
      "mocean-to": cleanFrom, // Send to verified number only
      "mocean-text": message,
      "mocean-resp-format": "json",
    });

    console.log(`📱 Sending SMS via MoceanAPI to ${cleanFrom}`);
    console.log(
      `📝 API Token (first 10 chars): ${process.env.MOCEAN_API_TOKEN.substring(
        0,
        10
      )}...`
    );

    const response = await axios.post(url, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("📥 MoceanAPI Response:", response.data);

    // MoceanAPI success response structure
    if (response.data.messages && response.data.messages[0].status === "0") {
      console.log("✅ SMS sent successfully");
      return {
        success: true,
        messageId: response.data.messages[0]["message-id"],
        response: response.data,
      };
    } else {
      const errorMsg =
        response.data.messages?.[0]?.err_msg ||
        response.data.messages?.[0]?.["error-text"] ||
        "Unknown error";
      console.error("❌ MoceanAPI returned an error:", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.message);
    if (error.response) {
      console.error("❌ Response Status:", error.response.status);
      console.error("❌ Response Data:", error.response.data);
    }
    return {
      success: false,
      error:
        error.response?.data?.messages?.[0]?.err_msg ||
        error.response?.data?.message ||
        error.message,
    };
  }
};

/**
 * Schedule SMS reminder for an event
 * @param {Object} event - Event object from database
 * @returns {Promise<string>} - Job ID
 */
export const scheduleSMSReminder = async (event) => {
  const jobId = `event_${event._id}_${Date.now()}`;

  // Create message content
  const eventDateFormatted = new Date(event.dateTime).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  const eventTimeFormatted = new Date(event.dateTime).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const message = `REMINDER: ${event.title}

${event.description || "No description"}

Date: ${eventDateFormatted}
Time: ${eventTimeFormatted}

Recipients: ${event.phoneNumbers.join(", ")}

- SAAJNA Legal`;

  // Calculate when to send
  const eventDate = new Date(event.dateTime);
  const now = new Date();

  // If event is in the past, don't schedule
  if (eventDate <= now) {
    console.log("⚠️ Event is in the past, not scheduling");
    return null;
  }

  console.log(`⏰ Scheduling SMS reminder for ${event.title} at ${eventDate}`);
  console.log(
    `📱 Target recipients (for info): ${event.phoneNumbers.join(", ")}`
  );
  console.log(`📱 Actual SMS will be sent to: ${process.env.MOCEAN_FROM}`);

  // Create cron expression for exact time
  const minutes = eventDate.getMinutes();
  const hours = eventDate.getHours();
  const day = eventDate.getDate();
  const month = eventDate.getMonth() + 1;
  const cronExpression = `${minutes} ${hours} ${day} ${month} *`;

  console.log(`📅 Cron expression: ${cronExpression}`);

  // Schedule the job
  const job = cron.schedule(
    cronExpression,
    async () => {
      console.log(`🔔 Sending SMS reminder for event: ${event.title}`);

      try {
        // Send SMS to verified number
        const result = await sendSMSViaMocean(message);

        console.log(`📊 SMS Result:`, result);

        if (result.success) {
          // Update event status in database
          await Event.findByIdAndUpdate(event._id, {
            notificationSent: true,
            status: "completed",
          });
          console.log(`✅ Event status updated to completed`);
        } else {
          console.error("❌ SMS send failed");
          await Event.findByIdAndUpdate(event._id, {
            status: "cancelled",
          });
        }
      } catch (error) {
        console.error("❌ Error in scheduled job:", error);
        await Event.findByIdAndUpdate(event._id, {
          status: "cancelled",
        });
      }

      // Remove job from memory
      scheduledJobs.delete(jobId);
    },
    {
      scheduled: false,
      timezone: "Asia/Kolkata",
    }
  );

  // Start the job
  job.start();

  // Store job reference
  scheduledJobs.set(jobId, job);

  console.log(`✅ Scheduled SMS reminder for ${event.title}`);
  return jobId;
};

/**
 * Cancel scheduled SMS
 * @param {string} jobId - Job ID to cancel
 * @returns {boolean} - Success status
 */
export const cancelScheduledSMS = (jobId) => {
  const job = scheduledJobs.get(jobId);
  if (job) {
    job.destroy();
    scheduledJobs.delete(jobId);
    console.log(`🗑️ Cancelled scheduled SMS job: ${jobId}`);
    return true;
  }
  return false;
};

/**
 * Send immediate test SMS
 * @returns {Promise<Object>} - Result
 */
export const sendTestSMS = async () => {
  const message = `Test SMS from SAAJNA Legal. This is a test message to verify SMS functionality. Time: ${new Date().toLocaleString(
    "en-IN"
  )}`;

  console.log(`🧪 Starting test SMS`);
  const result = await sendSMSViaMocean(message);
  console.log(`🧪 Test SMS result:`, result);

  return result;
};

/**
 * Re-schedule existing events on server restart
 */
export const rescheduleExistingEvents = async () => {
  try {
    console.log("🔄 Rescheduling existing events...");

    const now = new Date();

    // Find all scheduled events in the future
    const upcomingEvents = await Event.find({
      status: "scheduled",
      dateTime: { $gt: now },
    });

    console.log(`Found ${upcomingEvents.length} upcoming events to reschedule`);

    for (const event of upcomingEvents) {
      try {
        const jobId = await scheduleSMSReminder(event);
        if (jobId) {
          event.reminderJobId = jobId;
          await event.save();
          console.log(`✅ Rescheduled: ${event.title}`);
        }
      } catch (error) {
        console.error(`❌ Failed to reschedule ${event.title}:`, error.message);
      }
    }

    console.log("✅ Event rescheduling complete");
  } catch (error) {
    console.error("❌ Error rescheduling events:", error);
  }
};
