import { Request, Response } from "express";
import { escapeXml } from "../utils/xml";
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
  try {
    const userMessage: string | undefined = req.body.Body;
    const userPhone: string | undefined = req.body.From;

    if (!userMessage || !userPhone) {
      return res.status(400).send("Invalid request");
    }

    console.log(`📩 Incoming message from ${userPhone}: ${userMessage}`);

    let user = await registerWhatsAppUser(userPhone);
    console.log(`✅ User UUID: ${user.uuid}, Role: ${user.role}`);

    if (user.pendingConfirmationQueryId) {
      const normalized = userMessage.trim().toLowerCase();

      if (["yes", "y", "sure", "ok"].includes(normalized)) {
        await updateQueryStatus(user.pendingConfirmationQueryId, "RESOLVED");
        await clearPendingConfirmation(user.uuid);

        return res.type("text/xml").send(`
          <Response>
            <Message>Awesome ✅ I’ve marked your query as resolved.</Message>
          </Response>
        `);
      }

      if (["no", "n", "not really"].includes(normalized)) {
        await updateQueryStatus(
          user.pendingConfirmationQueryId,
          "NEEDS_FOLLOWUP"
        );
        await clearPendingConfirmation(user.uuid);

        return res.type("text/xml").send(`
          <Response>
            <Message>
              Got it 👍 I’ve marked it as needs follow-up. A facilitator will respond again soon.
            </Message>
          </Response>
        `);
      }

      return res.type("text/xml").send(`
        <Response>
          <Message>
            Please reply YES if the response solved your issue, or NO if you need follow-up.
          </Message>
        </Response>
      `);
    }


    if (user.pendingEscalation && user.pendingMessage) {
      const normalized = userMessage.trim().toLowerCase();

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

        return res.type("text/xml").send(`
          <Response>
            <Message>
              Got it 👌 Your query has been escalated to a facilitator.
              They will respond shortly.
            </Message>
          </Response>
        `);
      }

      if (["no", "n", "not now"].includes(normalized)) {
        await clearPendingEscalation(user.uuid);

        return res.type("text/xml").send(`
          <Response>
            <Message>
              No worries! Can you please clarify your question so I can try to help?
            </Message>
          </Response>
        `);
      }

      return res.type("text/xml").send(`
        <Response>
          <Message>
            Do you want me to escalate your previous question to a facilitator?
            Please reply Yes or No.
          </Message>
        </Response>
      `);
    }


    const greeting = generateGreeting(user, userMessage);
    if (greeting) {
      return res.type("text/xml").send(`
        <Response>
          <Message>${escapeXml(greeting)}</Message>
        </Response>
      `);
    }

    const ragResult = await ragEngine(userMessage);

    if (ragResult.shouldEscalate) {
      await markPendingEscalation(user.uuid, userMessage);

      return res.type("text/xml").send(`
        <Response>
          <Message>
            Hmmm 🤔 I'm not sure I can answer that accurately.
            Would you like me to escalate this question to a facilitator?
            Please reply Yes or No.
          </Message>
        </Response>
      `);
    }

    const friendlyAnswer =
      ragResult.answer?.trim() ?? "Hello! How can I help you today?";

    return res.type("text/xml").send(`
      <Response>
        <Message>${escapeXml(friendlyAnswer)}</Message>
      </Response>
    `);

  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error);

    return res.type("text/xml").send(`
      <Response>
        <Message>
          Sorry, something went wrong. Please try again later.
        </Message>
      </Response>
    `);
  }
}