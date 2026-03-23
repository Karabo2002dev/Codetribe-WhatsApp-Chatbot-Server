"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAssignmentEmail = sendAssignmentEmail;
exports.sendFollowUpEmail = sendFollowUpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function sendAssignmentEmail(email, question, phone) {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    await transporter.verify();
    console.log("✅ Email server ready");
    await transporter.sendMail({
        from: `"WhatsApp Support Bot" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "📩 New WhatsApp Query Assigned",
        html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #0f9d58; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">📬 New WhatsApp Query Assigned</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Hello 👋,</p>
          <p>You have been assigned a new WhatsApp query. Please review and respond promptly. ✅</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 120px;">📞 From:</td>
              <td style="padding: 8px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">❓ Question:</td>
              <td style="padding: 8px; border-left: 3px solid #0f9d58; padding-left: 10px;">${question}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">🕒 Date:</td>
              <td style="padding: 8px;">${new Date().toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">⚡ Status:</td>
              <td style="padding: 8px; border-left: 3px solid #facc15; padding-left: 10px;">Open</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">
            <a href="${process.env.FACILITATOR_DASHBOARD_URL}" 
               style="
                 display: inline-block;
                 background-color: #0f9d58;
                 color: #fff;
                 padding: 12px 24px;
                 border-radius: 6px;
                 text-decoration: none;
                 font-weight: bold;
               ">
              👀 View & Respond to Query
            </a>
          </p>

          <p style="margin-top: 20px; font-size: 12px; color: #888;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #555;">
          &copy; ${new Date().getFullYear()} WhatsApp Support. All rights reserved.
        </div>

      </div>
    </div>
  `,
    });
}
async function sendFollowUpEmail(email, question, phone) {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    await transporter.sendMail({
        from: `"WhatsApp Support Bot" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔁 Query Needs Follow Up",
        html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #f59e0b; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🔁 Query Needs Follow Up</h2>
        </div>

        <div style="padding: 20px;">
          <p>Hello 👋,</p>

          <p>
            The student indicated that their issue is <strong>not resolved</strong>.
            Please follow up on this query.
          </p>

          <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">📞 Student:</td>
              <td style="padding: 8px;">${phone}</td>
            </tr>

            <tr>
              <td style="padding: 8px; font-weight: bold;">❓ Question:</td>
              <td style="padding: 8px;">${question}</td>
            </tr>

            <tr>
              <td style="padding: 8px; font-weight: bold;">⚠️ Status:</td>
              <td style="padding: 8px;">Needs Follow Up</td>
            </tr>
          </table>

          <p style="margin-top:20px;">
            <a href="${process.env.FACILITATOR_DASHBOARD_URL}"
              style="background:#f59e0b;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Open Facilitator Dashboard
            </a>
          </p>

          <p style="font-size:12px;color:#888;margin-top:20px;">
            Automated message from WhatsApp Support System.
          </p>
        </div>

      </div>
    </div>
    `,
    });
}
