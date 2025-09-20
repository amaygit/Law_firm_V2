import cron from "node-cron";
import Event from "../models/event.js";

// Store scheduled jobs in memory (in production, use Redis)
const scheduledJobs = new Map();

// ✅ CORRECTED: Twilio WhatsApp implementation
export const sendWhatsAppViaTwilio = async (phoneNumber, message) => {
  try {
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

    console.log(`Sending WhatsApp to: ${formattedNumber}`);

    const result = await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", // Twilio Sandbox WhatsApp number
      to: `whatsapp:${formattedNumber}`, // ✅ User's phone number
    });

    console.log(`✅ WhatsApp sent successfully! SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error.message);

    // Log specific Twilio errors
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code}`);
    }
    return false;
  }
};

// // Alternative: WhatsApp Web method (completely free)
// import { Client, LocalAuth } from "whatsapp-web.js";

// let whatsappClient = null;

// export const initializeWhatsApp = () => {
//   try {
//     whatsappClient = new Client({
//       authStrategy: new LocalAuth({
//         dataPath: "./whatsapp-session",
//       }),
//       puppeteer: {
//         headless: true,
//         args: [
//           "--no-sandbox",
//           "--disable-setuid-sandbox",
//           "--disable-dev-shm-usage",
//           "--disable-accelerated-2d-canvas",
//           "--no-first-run",
//           "--no-zygote",
//           "--disable-gpu",
//         ],
//       },
//     });

//     whatsappClient.on("qr", (qr) => {
//       console.log("🔗 WhatsApp QR Code received!");
//       console.log("📱 Scan this QR code with your WhatsApp:");
//       console.log(
//         "🔗 QR Generator: https://qr-server.com/api/v1/create-qr-code/?size=200x200&data=" +
//           encodeURIComponent(qr)
//       );
//       console.log("\n" + qr + "\n");
//     });

//     whatsappClient.on("ready", () => {
//       console.log("✅ WhatsApp Web client is ready!");
//     });

//     whatsappClient.on("auth_failure", (msg) => {
//       console.error("❌ WhatsApp authentication failed:", msg);
//     });

//     whatsappClient.on("disconnected", (reason) => {
//       console.log("📱 WhatsApp client disconnected:", reason);
//     });

//     whatsappClient.initialize();
//   } catch (error) {
//     console.error("Failed to initialize WhatsApp Web:", error);
//   }
// };

// export const sendWhatsAppViaWeb = async (phoneNumber, message) => {
//   try {
//     if (!whatsappClient) {
//       throw new Error("WhatsApp client not initialized");
//     }

//     // Format phone number for WhatsApp Web
//     let formattedNumber = phoneNumber.replace(/[^\d]/g, ""); // Remove all non-digits

//     // Add country code if not present
//     if (!formattedNumber.startsWith("91") && formattedNumber.length === 10) {
//       formattedNumber = "91" + formattedNumber; // Default to India
//     }

//     const chatId = formattedNumber + "@c.us";

//     await whatsappClient.sendMessage(chatId, message);
//     console.log(`✅ WhatsApp Web message sent to ${phoneNumber}`);
//     return true;
//   } catch (error) {
//     console.error("❌ Failed to send WhatsApp Web message:", error.message);
//     return false;
//   }
// };

// ✅ MAIN FUNCTION: Schedule WhatsApp message
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
        // Try Twilio first, fallback to WhatsApp Web
        let sent = await sendWhatsAppViaTwilio(event.phoneNumber, message);

        if (!sent) {
          console.log("⚠️ Twilio failed, trying WhatsApp Web...");
          sent = await sendWhatsAppViaWeb(event.phoneNumber, message);
        }

        if (sent) {
          // Update event status in database
          await Event.findByIdAndUpdate(event._id, {
            notificationSent: true,
            status: "completed",
          });
          console.log("✅ Event status updated to completed");
        } else {
          console.error("❌ All WhatsApp methods failed");
          await Event.findByIdAndUpdate(event._id, {
            status: "cancelled",
          });
        }
      } catch (error) {
        console.error("❌ Error in scheduled job:", error);
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

  console.log(`✅ Scheduled WhatsApp reminder for ${event.title}`);
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
