import { Request, Response } from "express";
import { twiml } from "twilio";

import {
  registerWhatsAppUser,
  markPendingEscalation,
  clearPendingEscalation,
  clearPendingConfirmation,
} from "../services/whatsappUserService";

import {
  escalateQuery,
  assignQueryToFreeFacilitator,
  updateQueryStatus,
} from "../services/queryService";

import { ragEngine } from "../rag/ragEngine";
import { generateGreeting } from "../utils/genarateGreetings";

export async function whatsappWebhook(req: Request, res: Response) {
  const messagingResponse = new twiml.MessagingResponse();

  const sendMessage = (message: string) => {
    messagingResponse.message(message);
    return res.type("text/xml").send(messagingResponse.toString());
  };

  try {
    const userMessage: string | undefined = req.body.Body;
    const userPhone: string | undefined = req.body.From;

    if (!userMessage || !userPhone) {
      return res.status(400).send("Invalid request");
    }

    console.log(`📩 Incoming message from ${userPhone}: ${userMessage}`);

    const user = await registerWhatsAppUser(userPhone);
    console.log(`✅ User UUID: ${user.uuid}, Role: ${user.role}`);

    const normalized = userMessage.trim().toLowerCase();

    // ==============================
    // Pending Confirmation
    // ==============================
    if (user.pendingConfirmationQueryId) {
      if (["yes", "y", "sure", "ok"].includes(normalized)) {
        await updateQueryStatus(user.pendingConfirmationQueryId, "RESOLVED");
        await clearPendingConfirmation(user.uuid);

        return sendMessage(
          `Thank you for contacting CodeTribe Support! ✅

Your query has been successfully marked as resolved.
If you need any further assistance, feel free to reach out 😊`
        );
      }

      if (["no", "n", "not really"].includes(normalized)) {
        await updateQueryStatus(
          user.pendingConfirmationQueryId,
          "NEEDS_FOLLOWUP"
        );
        await clearPendingConfirmation(user.uuid);

        return sendMessage(
          `Thanks for letting me know 👍

I’ve marked your query as needing follow-up.
A facilitator will get back to you soon.`
        );
      }

      return sendMessage(
        `Just to confirm 😊

Reply YES if your issue is solved,
or NO if you still need help.`
      );
    }

    // ==============================
    // Pending Escalation
    // ==============================
    if (user.pendingEscalation && user.pendingMessage) {
      if (["yes", "y", "sure", "ok"].includes(normalized)) {
        const query = await escalateQuery(
          user.uuid,
          user.phone,
          user.pendingMessage
        );

        await clearPendingEscalation(user.uuid);

        await assignQueryToFreeFacilitator(
          query.id,
          user.pendingMessage,
          user.phone
        );

        return sendMessage(
          `Perfect ✅

Your query has been escalated to a facilitator.
They will respond as soon as possible.`
        );
      }

      if (["no", "n", "not now"].includes(normalized)) {
        await clearPendingEscalation(user.uuid);

        return sendMessage(
          `No problem 😊

Please share more details and I’ll assist you.`
        );
      }

      return sendMessage(
        `Would you like me to escalate your previous question to a facilitator?

Reply YES or NO.`
      );
    }

    // ==============================
    // Greeting
    // ==============================
    const greeting = generateGreeting(user, userMessage);
    if (greeting) {
      return sendMessage(greeting);
    }

    // ==============================
    // RAG Flow
    // ==============================
    const ragResult = await ragEngine(userMessage);

    if (ragResult.shouldEscalate) {
      await markPendingEscalation(user.uuid, userMessage);

      return sendMessage(
        `Hmm 🤔 I may not fully understand your question.

Could you clarify a bit more?

If you'd prefer, I can escalate your question to a facilitator.

Reply YES or NO.`
      );
    }

    const friendlyAnswer =
      ragResult.answer?.trim() ??
      "Hello! 😊 How can I help you today?";

    console.log(`💡 RAG answer for ${userPhone}: ${friendlyAnswer}`);

    return sendMessage(friendlyAnswer);
  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error);

    messagingResponse.message(
      `Sorry 😥 Something went wrong on my side.
Please try again in a moment.`
    );

    return res.type("text/xml").send(messagingResponse.toString());
  }
}