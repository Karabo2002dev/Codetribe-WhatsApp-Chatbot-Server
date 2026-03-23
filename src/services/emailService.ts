import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);


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
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          
          <div style="background-color: #0f9d58; color: #fff; padding: 20px; text-align: center;">
            <h2>📬 New WhatsApp Query Assigned</h2>
          </div>

          <div style="padding: 20px;">
            <p>Hello 👋,</p>
            <p>You have been assigned a new WhatsApp query.</p>

            <p><strong>📞 From:</strong> ${phone}</p>
            <p><strong>❓ Question:</strong> ${question}</p>
            <p><strong>🕒 Date:</strong> ${new Date().toLocaleDateString()}</p>

            <a href="${process.env.FACILITATOR_DASHBOARD_URL}"
              style="display:inline-block;margin-top:15px;background:#0f9d58;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;">
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
      <div style="font-family: Arial, sans-serif;">
        <h2>🔁 Query Needs Follow Up</h2>

        <p>The issue is not resolved.</p>

        <p><strong>📞 Student:</strong> ${phone}</p>
        <p><strong>❓ Question:</strong> ${question}</p>

        <a href="${process.env.FACILITATOR_DASHBOARD_URL}">
          Open Dashboard
        </a>
      </div>
      `,
    });

    console.log("✅ Follow-up email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

