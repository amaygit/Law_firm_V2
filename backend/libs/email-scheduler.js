import { Resend } from "resend";
import cron from "node-cron";
import Event from "../models/event.js";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Store scheduled jobs in memory
const scheduledJobs = new Map();

/**
 * Send Email via Resend
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 * @returns {Promise<Object>} - Result object
 */
export const sendEmailViaResend = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Resend API key not configured");
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    console.log(`📧 Sending email via Resend to ${to}`);
    console.log(`📤 From: ${fromEmail}`);
    console.log(`📝 Subject: ${subject}`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Resend returned an error:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }

    console.log("✅ Email sent successfully");
    console.log("📥 Resend Response:", data);

    return {
      success: true,
      messageId: data.id,
      response: data,
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate HTML email template
 * @param {Object} event - Event object
 * @returns {string} - HTML email content
 */
const generateEmailTemplate = (event) => {
  const eventDateFormatted = new Date(event.dateTime).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const eventTimeFormatted = new Date(event.dateTime).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                🔔 Event Reminder
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                ${event.title}
              </h2>
              
              ${
                event.description
                  ? `<p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                ${event.description}
              </p>`
                  : ""
              }

              <!-- Event Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 15px;">
                                <div style="background-color: #667eea; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="font-size: 20px;">📅</span>
                                </div>
                              </td>
                              <td>
                                <p style="margin: 0; color: #666666; font-size: 14px;">Date</p>
                                <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px; font-weight: 600;">
                                  ${eventDateFormatted}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 15px;">
                                <div style="background-color: #764ba2; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="font-size: 20px;">⏰</span>
                                </div>
                              </td>
                              <td>
                                <p style="margin: 0; color: #666666; font-size: 14px;">Time</p>
                                <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px; font-weight: 600;">
                                  ${eventTimeFormatted}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                This is an automated reminder for your scheduled event.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: 600;">
                SAAJNA Legal
              </p>
              <p style="margin: 0; color: #999999; font-size: 14px;">
                Event Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Schedule Email reminder for an event
 * @param {Object} event - Event object from database
 * @param {string} userEmail - User's email address
 * @returns {Promise<string>} - Job ID
 */
export const scheduleEmailReminder = async (event, userEmail) => {
  const jobId = `event_${event._id}_${Date.now()}`;

  // Calculate when to send
  const eventDate = new Date(event.dateTime);
  const now = new Date();

  // If event is in the past, don't schedule
  if (eventDate <= now) {
    console.log("⚠️ Event is in the past, not scheduling");
    return null;
  }

  console.log(
    `⏰ Scheduling email reminder for ${event.title} at ${eventDate}`
  );
  console.log(`📧 Recipient: ${userEmail}`);

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
      console.log(`🔔 Sending email reminder for event: ${event.title}`);

      try {
        const subject = `🔔 Reminder: ${event.title}`;
        const html = generateEmailTemplate(event);

        // Send email
        const result = await sendEmailViaResend(userEmail, subject, html);

        console.log(`📊 Email Result:`, result);

        if (result.success) {
          // Update event status in database
          await Event.findByIdAndUpdate(event._id, {
            notificationSent: true,
            status: "completed",
          });
          console.log(`✅ Event status updated to completed`);
        } else {
          console.error("❌ Email send failed");
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

  console.log(`✅ Scheduled email reminder for ${event.title}`);
  return jobId;
};

/**
 * Cancel scheduled email
 * @param {string} jobId - Job ID to cancel
 * @returns {boolean} - Success status
 */
export const cancelScheduledEmail = (jobId) => {
  const job = scheduledJobs.get(jobId);
  if (job) {
    job.destroy();
    scheduledJobs.delete(jobId);
    console.log(`🗑️ Cancelled scheduled email job: ${jobId}`);
    return true;
  }
  return false;
};

/**
 * Send immediate test email
 * @param {string} userEmail - User's email address
 * @returns {Promise<Object>} - Result
 */
export const sendTestEmail = async (userEmail) => {
  const subject = "🧪 Test Email from SAAJNA Legal";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🧪 Test Email</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #333333; margin: 0 0 20px 0;">Email System Working!</h2>
      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
        This is a test email to verify that your email reminder system is configured correctly.
      </p>
      <p style="color: #999999; font-size: 14px; margin: 0;">
        Sent at: ${new Date().toLocaleString("en-IN")}
      </p>
    </div>
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center;">
      <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">SAAJNA Legal</p>
      <p style="margin: 10px 0 0 0; color: #999999; font-size: 14px;">Event Management System</p>
    </div>
  </div>
</body>
</html>
  `;

  console.log(`🧪 Starting test email to ${userEmail}`);
  const result = await sendEmailViaResend(userEmail, subject, html);
  console.log(`🧪 Test email result:`, result);

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
    }).populate("createdBy", "email");

    console.log(`Found ${upcomingEvents.length} upcoming events to reschedule`);

    for (const event of upcomingEvents) {
      try {
        const userEmail = event.createdBy.email;
        const jobId = await scheduleEmailReminder(event, userEmail);
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
