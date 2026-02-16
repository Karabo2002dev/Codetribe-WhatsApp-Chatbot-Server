import { Request, Response } from "express";
import { escapeXml } from "../utils/xml";
import {
  registerWhatsAppUser,
  markPendingEscalation,
  clearPendingEscalation,
} from "../services/whatsappUserService";
import {
  escalateQuery,
  assignQueryToFreeFacilitator,
} from "../services/queryService";
import { ragEngine } from "../rag/ragEngine";
import { generateGreeting } from "../utils/genarateGreetings";
import { sendAssignmentEmail } from "../services/emailService";

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

    if (user.pendingEscalation && user.pendingMessage) {
      const normalized = userMessage.trim().toLowerCase();

      if (["yes", "y", "sure", "ok"].includes(normalized)) {

        const query = await escalateQuery(user.uuid, user.phone, user.pendingMessage);
        await clearPendingEscalation(user.uuid);

        await assignQueryToFreeFacilitator(query.id, user.pendingMessage, user.phone);

        return res.type("text/xml").send(`
          <Response>
            <Message>
              Got it 👌 Your query has been escalated to a facilitator. They will respond shortly.
            </Message>
          </Response>
        `);
      } else if (["no", "n", "not now"].includes(normalized)) {

        await clearPendingEscalation(user.uuid);
        return res.type("text/xml").send(`
          <Response>
            <Message>
              No worries! Can you please clarify your question so I can try to help?
            </Message>
          </Response>
        `);
      } else {
        return res.type("text/xml").send(`
          <Response>
            <Message>
              Do you want me to escalate your previous question to a facilitator? Please reply Yes or No.
            </Message>
          </Response>
        `);
      }
    }

    const greeting = generateGreeting(user, userMessage);
    if (greeting) {
      console.log("💬 Sending greeting");
      return res.type("text/xml").send(`
        <Response>
          <Message>${escapeXml(greeting)}</Message>
        </Response>
      `);
    }

    const ragResult = await ragEngine(userMessage);
    console.log("🧠 RAG Debug:", ragResult.debug);
    console.log("⚠️ Should Escalate:", ragResult.shouldEscalate, ragResult.reason);

    if (ragResult.shouldEscalate) {

      await markPendingEscalation(user.uuid, userMessage);

      return res.type("text/xml").send(`
        <Response>
          <Message>
            Hmmm 🤔 I'm not sure I can answer that accurately. 
            Would you like me to escalate this question to a facilitator? Please reply Yes or No.
          </Message>
        </Response>
      `);
    }

    const friendlyAnswer = ragResult.answer?.trim() ?? "Hello! How can I help you today?";
    console.log("🤖 AI Answer:", friendlyAnswer);

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


