import cron from "node-cron";
import Event from "../models/event.js";

/**
 * Send Email via Resend (TEMP - replaced with no-op to prevent crashes)
 */
export const sendEmailViaResend = async (to, subject, html) => {
  console.warn("🚧 sendEmailViaResend is disabled. Skipping send.");
  return {
    success: false,
    error: "Resend is disabled in this environment"
  };
};


/**
 * Generate HTML email template
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
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                🔔 Event Reminder
              </h1>
            </td>
          </tr>
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
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Date</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px; font-weight: 600;">
                            ${eventDateFormatted}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
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
              <p style="color: #666666; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                This is an automated reminder for your scheduled event.
              </p>
            </td>
          </tr>
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
 * IMPROVED: Check events every minute instead of using exact cron times
 */
export const startEmailChecker = () => {
  console.log("🚀 Starting email checker (runs every minute)");

  // Run every minute
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);

        // Find events that should have been triggered in the last minute
        const dueEvents = await Event.find({
          status: "scheduled",
          dateTime: {
            $gte: oneMinuteAgo,
            $lte: now,
          },
          notificationSent: false,
        }).populate("createdBy", "email");

        if (dueEvents.length > 0) {
          console.log(`📬 Found ${dueEvents.length} events to process`);
        }

        for (const event of dueEvents) {
          try {
            console.log(`🔔 Processing event: ${event.title}`);

            const subject = `🔔 Reminder: ${event.title}`;
            const html = generateEmailTemplate(event);
            const userEmail = event.createdBy.email;

            const result = await sendEmailViaResend(userEmail, subject, html);

            if (result.success) {
              await Event.findByIdAndUpdate(event._id, {
                notificationSent: true,
                status: "completed",
              });
              console.log(
                `✅ Email sent and event marked as completed: ${event.title}`
              );
            } else {
              console.error(
                `❌ Failed to send email for: ${event.title}`,
                result.error
              );
              await Event.findByIdAndUpdate(event._id, {
                status: "cancelled",
              });
            }
          } catch (error) {
            console.error(`❌ Error processing event ${event.title}:`, error);
          }
        }
      } catch (error) {
        console.error("❌ Error in email checker:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};

/**
 * DEPRECATED: Use startEmailChecker instead
 * Keep this for backwards compatibility but it won't be used
 */
export const scheduleEmailReminder = async (event, userEmail) => {
  const jobId = `event_${event._id}_${Date.now()}`;
  console.log(
    `⚠️ scheduleEmailReminder called but using minute-checker instead`
  );
  return jobId;
};

/**
 * Cancel scheduled email (not needed with new approach but kept for API compatibility)
 */
export const cancelScheduledEmail = (jobId) => {
  console.log(
    `🗑️ Cancel requested for: ${jobId} (using database status instead)`
  );
  return true;
};

/**
 * Send immediate test email
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
 * NOT NEEDED with new approach - events are checked every minute
 */
export const rescheduleExistingEvents = async () => {
  console.log(
    " rescheduleExistingEvents called but not needed with minute-checker"
  );
};
