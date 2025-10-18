import axios from "axios";
import cron from "node-cron";
import Event from "../models/event.js";

// Store scheduled jobs in memory
const scheduledJobs = new Map();

/**
 * Send SMS via Fast2SMS
 * @param {string} phoneNumber - Phone number WITHOUT country code (10 digits for India)
 * @param {string} message - SMS message text
 * @returns {Promise<Object>} - Result object
 */
export const sendSMSViaSMSLocal = async (phoneNumber, message) => {
  try {
    if (!process.env.SMSLOCAL_API_KEY) {
      throw new Error("SMSLocal API key not configured");
    }

    // Format phone number to include +91
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (formattedNumber.length === 10) {
      formattedNumber = `91${formattedNumber}`;
    }

    // Construct the API request
    const url = "https://www.smslocal.in/api/send/";

    const params = {
      api_key: process.env.SMSLOCAL_API_KEY,
      message: message,
      numbers: formattedNumber,
      sender: process.env.SMSLOCAL_SENDER || "SAAJNA",
      language: "english",
      route: "quick",
    };

    console.log(`📱 Sending SMS via SMSLocal to ${formattedNumber}`);
    const response = await axios.post(url, params, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("📥 SMSLocal Response:", response.data);

    if (response.data.status === "success" || response.data.return === true) {
      console.log("✅ SMS sent successfully");
      return {
        success: true,
        messageId: response.data.message_id || response.data.batch_id,
        phoneNumber: formattedNumber,
        response: response.data,
      };
    } else {
      console.error("❌ SMSLocal returned an error:", response.data);
      return {
        success: false,
        error: response.data.message || "Unknown SMSLocal error",
        phoneNumber: formattedNumber,
      };
    }
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.message);
    if (error.response) {
      console.error("❌ Response Data:", error.response.data);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      phoneNumber,
    };
  }
};

// /**
//  * Send SMS to multiple phone numbers with rate limiting
//  * @param {string[]} phoneNumbers - Array of phone numbers
//  * @param {string} message - SMS message
//  * @returns {Promise<Array>} - Array of results
//  */
// export const sendSMSToMultiple = async (phoneNumbers, message) => {
//   const results = [];

//   for (const [index, phoneNumber] of phoneNumbers.entries()) {
//     try {
//       console.log(
//         `📤 Sending SMS ${index + 1}/${phoneNumbers.length} to ${phoneNumber}`
//       );

//       const result = await sendSMSViaFast2SMS(phoneNumber, message);
//       results.push(result);

//       // Rate limiting: Fast2SMS has limit of 1 SMS per second
//       if (index < phoneNumbers.length - 1) {
//         console.log(`⏳ Waiting 2 seconds before next SMS...`);
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//       }
//     } catch (error) {
//       console.error(`❌ Failed to send to ${phoneNumber}:`, error.message);
//       results.push({
//         phoneNumber,
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   return results;
// };

/**
 * Schedule SMS reminder for an event
 * @param {Object} event - Event object from database
 * @returns {Promise<string>} - Job ID
 */
export const scheduleSMSReminder = async (event) => {
  const jobId = `event_${event._id}_${Date.now()}`;

  // Create message content - Keep it concise
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
  console.log(`📱 Phone numbers: ${event.phoneNumbers.join(", ")}`);

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
        // Send to all phone numbers
        const results = await sendSMSToMultiple(event.phoneNumbers, message);

        // Check if at least one message was sent successfully
        const successfulSends = results.filter((r) => r.success);
        const hasAnySuccess = successfulSends.length > 0;

        console.log(`📊 SMS Results:`, results);

        if (hasAnySuccess) {
          // Update event status in database
          await Event.findByIdAndUpdate(event._id, {
            notificationSent: true,
            status: "completed",
          });
          console.log(
            `✅ Event status updated to completed (${successfulSends.length}/${results.length} sent)`
          );
        } else {
          console.error("❌ All SMS sends failed");
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

  console.log(
    `✅ Scheduled SMS reminder for ${event.title} (${event.phoneNumbers.length} recipients)`
  );
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

// /**
//  * Send immediate test SMS (for testing)
//  * @param {string} phoneNumber - Test phone number
//  * @returns {Promise<Object>} - Result
//  */
// export const sendTestSMS = async (phoneNumber) => {
//   const message = `Test SMS from SAAJNA Legal. This is a test message to verify SMS functionality. Time: ${new Date().toLocaleString(
//     "en-IN"
//   )}`;

//   console.log(`🧪 Starting test SMS to ${phoneNumber}`);
//   const result = await sendSMSViaFast2SMS(phoneNumber, message);
//   console.log(`🧪 Test SMS result:`, result);

//   return result;
// };

/**
 * Re-schedule existing events on server restart
 * Call this function when server starts
 */
// export const rescheduleExistingEvents = async () => {
//   try {
//     console.log("🔄 Rescheduling existing events...");

//     const now = new Date();

//     // Find all scheduled events in the future
//     const upcomingEvents = await Event.find({
//       status: "scheduled",
//       dateTime: { $gt: now },
//     });

//     console.log(`Found ${upcomingEvents.length} upcoming events to reschedule`);

//     for (const event of upcomingEvents) {
//       try {
//         const jobId = await scheduleSMSReminder(event);
//         if (jobId) {
//           // Update the event with new job ID
//           event.reminderJobId = jobId;
//           await event.save();
//           console.log(`✅ Rescheduled: ${event.title}`);
//         }
//       } catch (error) {
//         console.error(`❌ Failed to reschedule ${event.title}:`, error.message);
//       }
//     }

//     console.log("✅ Event rescheduling complete");
//   } catch (error) {
//     console.error("❌ Error rescheduling events:", error);
//   }
// };
