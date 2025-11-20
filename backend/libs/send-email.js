import axios from "axios";

export async function sendEmail(to, subject, htmlContent) {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.SMTP_FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 10000,
      }
    );
    return res.status === 201;
  } catch (error) {
    console.error("Brevo HTTP Email Error:", error?.response?.data || error.message);
    return false;
  }
}
