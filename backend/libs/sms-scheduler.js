import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import cron from "node-cron";
import Event from "../models/event.js";

// Initialize AWS SNS Client
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "eu-north-1", // Mumbai region for India
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_SMS,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SMS,
  },
});

// Store scheduled jobs in memory
const scheduledJobs = new Map();

/**
 * Send SMS via AWS SNS
 * @param {string} phoneNumber - Phone number with country code (e.g., +919876543210)
 * @param {string} message - SMS message text
 * @returns {Promise<Object>} - Result object
 */
export const sendSMSViaSNS = async (phoneNumber, message) => {
  try {
    // Validate credentials
    if (
      !process.env.AWS_ACCESS_KEY_ID_SMS ||
      !process.env.AWS_SECRET_ACCESS_KEY_SMS
    ) {
      throw new Error("AWS credentials not configured");
    }

    // ✅ Format phone number correctly
    let formattedNumber = phoneNumber;

    // Remove any non-digit characters except +
    formattedNumber = formattedNumber.replace(/[^\d+]/g, "");

    // Add + if not present
    if (!formattedNumber.startsWith("+")) {
      // Default to India country code if no country code
      if (formattedNumber.length === 10) {
        formattedNumber = "+91" + formattedNumber;
      } else {
        formattedNumber = "+" + formattedNumber;
      }
    }

    console.log(`📱 Sending SMS via AWS SNS to: ${formattedNumber}`);

    // Create SNS publish command
    const params = {
      Message: message,
      PhoneNumber: formattedNumber,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional", // For important messages
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "SAAJNA", // Your sender ID (6 chars max)
        },
      },
    };

    const command = new PublishCommand(params);
    const result = await snsClient.send(command);

    console.log(`✅ SMS sent successfully! MessageId: ${result.MessageId}`);
    return {
      success: true,
      messageId: result.MessageId,
      phoneNumber: formattedNumber,
    };
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.message);

    // Log specific AWS errors
    if (error.name) {
      console.error(`AWS Error: ${error.name}`);
    }
    return {
      success: false,
      error: error.message,
      phoneNumber,
    };
  }
};

/**
 * Send SMS to multiple phone numbers with rate limiting
 * @param {string[]} phoneNumbers - Array of phone numbers
 * @param {string} message - SMS message
 * @returns {Promise<Array>} - Array of results
 */
export const sendSMSToMultiple = async (phoneNumbers, message) => {
  const results = [];

  for (const [index, phoneNumber] of phoneNumbers.entries()) {
    try {
      console.log(
        `📤 Sending SMS ${index + 1}/${phoneNumbers.length} to ${phoneNumber}`
      );

      const result = await sendSMSViaSNS(phoneNumber, message);
      results.push(result);

      // ✅ Rate limiting: Add delay between messages
      if (index < phoneNumbers.length - 1) {
        console.log(`⏳ Waiting 1 second before next SMS...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    } catch (error) {
      console.error(`❌ Failed to send to ${phoneNumber}:`, error.message);
      results.push({
        phoneNumber,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Schedule SMS reminder for an event
 * @param {Object} event - Event object from database
 * @returns {Promise<string>} - Job ID
 */
export const scheduleSMSReminder = async (event) => {
  const jobId = `event_${event._id}_${Date.now()}`;

  // Create message content
  const message = `🔔 REMINDER: ${event.title}

${event.description || "No description"}

📅 Date: ${new Date(event.dateTime).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

⏰ Time: ${new Date(event.dateTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}

- SAAJNA Legal`;

  // Validate message length (SMS max 160 chars for single message)
  if (message.length > 160) {
    console.warn(
      `⚠️ SMS message is ${message.length} chars (will be split into multiple SMS)`
    );
  }

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
        // ✅ Send to all phone numbers
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

/**
 * Send immediate test SMS (for testing)
 * @param {string} phoneNumber - Test phone number
 * @returns {Promise<Object>} - Result
 */
export const sendTestSMS = async (phoneNumber) => {
  const message = `🧪 Test SMS from SAAJNA Legal

This is a test message to verify SMS functionality.

Time: ${new Date().toLocaleString("en-IN")}

If you received this, SMS is working correctly! ✅`;

  return await sendSMSViaSNS(phoneNumber, message);
};
