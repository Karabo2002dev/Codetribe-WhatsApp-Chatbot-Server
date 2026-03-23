import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const dashboardUrl = process.env.FACILITATOR_DASHBOARD_URL || "#";

function getFormattedDate() {
  return new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function sendAssignmentEmail(
  email: string,
  question: string,
  phone: string
) {
  try {
    await resend.emails.send({
      from: "WhatsApp Support Bot <onboarding@resend.dev>",
      to: email,
      subject: "📩 New WhatsApp Query Assigned",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          
          <div style="background-color: #0f9d58; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">📬 New WhatsApp Query Assigned</h2>
          </div>

          <div style="padding: 20px;">
            <p>Hello 👋,</p>
            <p>You have been assigned a new WhatsApp query.</p>

            <p><strong>📞 From:</strong> ${phone}</p>
            <p><strong>❓ Question:</strong> ${question}</p>
            <p><strong>🕒 Date:</strong> ${getFormattedDate()}</p>

            <a
              href="${dashboardUrl}"
              style="display:inline-block;margin-top:15px;background:#0f9d58;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;"
            >
              👀 View & Respond
            </a>
          </div>
        </div>
      </div>
      `,
    });

    console.log("✅ Assignment email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

export async function sendFollowUpEmail(
  email: string,
  question: string,
  phone: string
) {
  try {
    await resend.emails.send({
      from: "WhatsApp Support Bot <onboarding@resend.dev>",
      to: email,
      subject: "🔁 Query Needs Follow Up",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

          <div style="background-color: #f4b400; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">🔁 Query Needs Follow Up</h2>
          </div>

          <div style="padding: 20px;">
            <p>Hello 👋,</p>
            <p>The issue is not resolved and still needs follow-up.</p>

            <p><strong>📞 Student:</strong> ${phone}</p>
            <p><strong>❓ Question:</strong> ${question}</p>
            <p><strong>🕒 Date:</strong> ${getFormattedDate()}</p>

            <a
              href="${dashboardUrl}"
              style="display:inline-block;margin-top:15px;background:#0f9d58;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;"
            >
              Open Dashboard
            </a>
          </div>
        </div>
      </div>
      `,
    });

    console.log("✅ Follow-up email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}
