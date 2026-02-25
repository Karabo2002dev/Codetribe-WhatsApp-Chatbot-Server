// src/services/twilioService.ts

import { twilioClient } from "../config/twilioClient";
import dotenv from "dotenv";
dotenv.config();

const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

if (!whatsappFrom) {
  throw new Error("❌ TWILIO_WHATSAPP_FROM missing. Use format: whatsapp:+123456789");
}

export async function sendWhatsAppMessage(toPhone: string, message: string) {
    console.log(`Sending WhatsApp message to ${toPhone}: ${message}`);
  const formattedTo = toPhone.startsWith("whatsapp:")
    ? toPhone
    : `whatsapp:${toPhone}`;

  return twilioClient.messages.create({
    from: whatsappFrom,
    to: formattedTo,    
    body: message,
  });
}

export async function sendWhatsAppConfirmationMessage(
  toPhone: string,
  responseText: string
) {
  const message =
    `✅ Facilitator response:\n\n${responseText}\n\n` +
    `Was this helpful?\nReply YES or NO`;

  return sendWhatsAppMessage(toPhone, message);
}