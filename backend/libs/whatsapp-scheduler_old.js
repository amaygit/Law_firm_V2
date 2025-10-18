import cron from "node-cron";
import Event from "../models/event.js";

// Store scheduled jobs in memory (in production, use Redis)
const scheduledJobs = new Map();

// ✅ TWILIO WHATSAPP IMPLEMENTATION
export const sendWhatsAppViaTwilio = async (phoneNumber, message) => {
  try {
    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    // Import Twilio
    const twilio = await import("twilio");
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

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

    // ✅ TWILIO SANDBOX: Use your Twilio WhatsApp sandbox number
    // For production, replace with your approved Twilio WhatsApp number
    const twilioWhatsAppNumber =
      process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

    console.log(`📱 Sending WhatsApp via Twilio to: ${formattedNumber}`);

    const result = await client.messages.create({
      body: message,
      from: twilioWhatsAppNumber, // Your Twilio WhatsApp number
      to: `whatsapp:${formattedNumber}`,
    });

    console.log(`✅ WhatsApp sent successfully! SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error.message);

    // Log specific Twilio errors
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code}`);
    }
    return { success: false, error: error.message };
  }
};

// ✅ TWILIO RATE LIMITING: Send to multiple phone numbers with proper delays
export const sendWhatsAppToMultiple = async (phoneNumbers, message) => {
  const results = [];

  for (const [index, phoneNumber] of phoneNumbers.entries()) {
    try {
      console.log(
        `📤 Sending message ${index + 1}/${
          phoneNumbers.length
        } to ${phoneNumber}`
      );

      const result = await sendWhatsAppViaTwilio(phoneNumber, message);
      results.push({
        phoneNumber,
        ...result,
      });

      // ✅ TWILIO RATE LIMITING: Add delay between messages (avoid hitting Twilio limits)
      if (index < phoneNumbers.length - 1) {
        console.log(
          `⏳ Waiting 3 seconds before next message (Twilio rate limiting)...`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay
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

// ✅ UPDATED: Schedule WhatsApp message for multiple numbers
export const scheduleWhatsAppMessage = async (event) => {
  const jobId = `event_${event._id}_${Date.now()}`;

  // Create message content
  const message = `🔔 *Event Reminder*

📅 *${event.title}*

📝 ${event.description || "No description provided"}

⏰ Scheduled for: ${new Date(event.dateTime).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  })}

📱 This reminder was scheduled via SAAJNA Legal Case Management System.`;

  // Calculate when to send (at the exact event time)
  const eventDate = new Date(event.dateTime);
  const now = new Date();

  // If event is in the past, don't schedule
  if (eventDate <= now) {
    console.log("⚠️ Event is in the past, not scheduling");
    return null;
  }

  console.log(`⏰ Scheduling reminder for ${event.title} at ${eventDate}`);
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
      console.log(`🔔 Sending reminder for event: ${event.title}`);

      try {
        // ✅ Send to all phone numbers
        const results = await sendWhatsAppToMultiple(
          event.phoneNumbers,
          message
        );

        // Check if at least one message was sent successfully
        const successfulSends = results.filter((r) => r.success);
        const hasAnySuccess = successfulSends.length > 0;

        console.log(`📊 WhatsApp Results:`, results);

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
          console.error("❌ All WhatsApp sends failed");
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
    `✅ Scheduled WhatsApp reminder for ${event.title} (${event.phoneNumbers.length} recipients)`
  );
  return jobId;
};

// Cancel scheduled message
export const cancelScheduledMessage = (jobId) => {
  const job = scheduledJobs.get(jobId);
  if (job) {
    job.destroy();
    scheduledJobs.delete(jobId);
    console.log(`🗑️ Cancelled scheduled job: ${jobId}`);
    return true;
  }
  return false;
};
