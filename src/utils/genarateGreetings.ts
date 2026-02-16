import { WhatsAppUser } from "../services/whatsappUserService";

const SIMPLE_GREETINGS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];

export function generateGreeting(user?: WhatsAppUser, message?: string): string {
  const now = new Date();

  if (message) {
    const normalizedMessage = message.trim().toLowerCase();
    if (SIMPLE_GREETINGS.includes(normalizedMessage)) {
      return "Hi 👋 How can I help you today?";
    }
  }

  if (!user) {
    return "Hi 👋 Welcome! I'm your friendly assistant. How can I help you today?";
  }

  const hoursSinceLastSeen =
    (now.getTime() - user.lastseen.getTime()) / 1000 / 3600;

  if (hoursSinceLastSeen > 12) {
    return `Hi again 👋 Welcome back! How can I assist you today?`;
  }

  return "";
}

