import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendAssignmentEmail(
  email: string,
  question: string,
  phone: string
) {
const transporter = nodemailer.createTransport({
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
    subject: "New WhatsApp Query Assigned",
    html: `
      <p>You have been assigned a new WhatsApp query.</p>
      <p><strong>From:</strong> ${phone}</p>
      <p><strong>Question:</strong></p>
      <blockquote>${question}</blockquote>
    `,
  });
}
