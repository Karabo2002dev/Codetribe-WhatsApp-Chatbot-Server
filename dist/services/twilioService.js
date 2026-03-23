"use strict";
// src/services/twilioService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
exports.sendWhatsAppConfirmationMessage = sendWhatsAppConfirmationMessage;
const twilioClient_1 = require("../config/twilioClient");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
if (!whatsappFrom) {
    throw new Error("❌ TWILIO_WHATSAPP_FROM missing. Use format: whatsapp:+123456789");
}
async function sendWhatsAppMessage(toPhone, message) {
    console.log(`Sending WhatsApp message to ${toPhone}: ${message}`);
    const formattedTo = toPhone.startsWith("whatsapp:")
        ? toPhone
        : `whatsapp:${toPhone}`;
    return twilioClient_1.twilioClient.messages.create({
        from: whatsappFrom,
        to: formattedTo,
        body: message,
    });
}
async function sendWhatsAppConfirmationMessage(toPhone, responseText) {
    const message = `✅ Facilitator response:\n\n${responseText}\n\n` +
        `Was this helpful?\nReply YES or NO`;
    return sendWhatsAppMessage(toPhone, message);
}
