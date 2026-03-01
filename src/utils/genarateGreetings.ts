import { WhatsAppUser } from "../services/whatsappUserService";

const SIMPLE_GREETINGS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];

export function generateGreeting(user?: WhatsAppUser, message?: string): string {
  const now = new Date();

  if (message) {
    const normalizedMessage = message.trim().toLowerCase();
    if (SIMPLE_GREETINGS.includes(normalizedMessage)) {
      return "👋 Hello! I’m your CodeTribe Academy support assistant. I can help you with schedules, assessments, attendance, programme rules, and other support services. How can I assist you today?";
    }
  }

  if (!user) {
    return "👋 Welcome to CodeTribe Academy! I’m your WhatsApp support assistant. You can ask me about your schedules, assessments, attendance, programme rules, or any other support services. I provide instant guidance to help you stay on track without waiting for a facilitator. How can I help you today?";
  }

  const hoursSinceLastSeen =
    (now.getTime() - user.lastseen.getTime()) / 1000 / 3600;

  if (hoursSinceLastSeen > 12) {
    return `👋 Welcome back! It’s been a while since your last query. I’m here to assist you instantly with schedules, assessments, attendance, programme rules, or any other support you need, so you won’t have to wait for a facilitator. How can I help today?`;
  }

  return "";
}

