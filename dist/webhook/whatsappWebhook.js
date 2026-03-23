"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = whatsappWebhook;
const twilio_1 = require("twilio");
const whatsappUserService_1 = require("../services/whatsappUserService");
const queryService_1 = require("../services/queryService");
const ragEngine_1 = require("../rag/ragEngine");
const genarateGreetings_1 = require("../utils/genarateGreetings");
async function whatsappWebhook(req, res) {
    const messagingResponse = new twilio_1.twiml.MessagingResponse();
    const sendMessage = (message) => {
        messagingResponse.message(message);
        return res.type("text/xml").send(messagingResponse.toString());
    };
    try {
        const userMessage = req.body.Body;
        const userPhone = req.body.From;
        if (!userMessage || !userPhone) {
            return res.status(400).send("Invalid request");
        }
        console.log(`📩 Incoming message from ${userPhone}: ${userMessage}`);
        const user = await (0, whatsappUserService_1.registerWhatsAppUser)(userPhone);
        console.log(`✅ User UUID: ${user.uuid}, Role: ${user.role}`);
        const normalized = userMessage.trim().toLowerCase();
        // ==============================
        // Pending Confirmation
        // ==============================
        if (user.pendingConfirmationQueryId) {
            if (["yes", "y", "sure", "ok"].includes(normalized)) {
                await (0, queryService_1.updateQueryStatus)(user.pendingConfirmationQueryId, "RESOLVED");
                await (0, whatsappUserService_1.clearPendingConfirmation)(user.uuid);
                return sendMessage(`Thank you for contacting CodeTribe Support! ✅

Your query has been successfully marked as resolved.
If you need any further assistance, feel free to reach out 😊`);
            }
            if (["no", "n", "not really"].includes(normalized)) {
                await (0, queryService_1.updateQueryStatus)(user.pendingConfirmationQueryId, "NEEDS_FOLLOWUP");
                await (0, queryService_1.notifyAssignedFacilitatorForFollowUp)(user.pendingConfirmationQueryId, user.phone);
                await (0, whatsappUserService_1.clearPendingConfirmation)(user.uuid);
                return sendMessage(`Thanks for letting me know 👍

I’ve marked your query as needing follow-up.
A facilitator will get back to you soon.`);
            }
            return sendMessage(`Just to confirm 😊

Reply YES if your issue is solved,
or NO if you still need help.`);
        }
        // ==============================
        // Pending Escalation
        // ==============================
        if (user.pendingEscalation && user.pendingMessage) {
            if (["yes", "y", "sure", "ok"].includes(normalized)) {
                const query = await (0, queryService_1.escalateQuery)(user.uuid, user.phone, user.pendingMessage);
                await (0, whatsappUserService_1.clearPendingEscalation)(user.uuid);
                await (0, queryService_1.assignQueryToFreeFacilitator)(query.id, user.pendingMessage, user.phone);
                return sendMessage(`Perfect ✅

Your query has been escalated to a facilitator.
They will respond as soon as possible.`);
            }
            if (["no", "n", "not now"].includes(normalized)) {
                await (0, whatsappUserService_1.clearPendingEscalation)(user.uuid);
                return sendMessage(`No problem 😊

Please share more details and I’ll assist you.`);
            }
            return sendMessage(`Would you like me to escalate your previous question to a facilitator?

Reply YES or NO.`);
        }
        // ==============================
        // Greeting
        // ==============================
        const greeting = (0, genarateGreetings_1.generateGreeting)(user, userMessage);
        if (greeting) {
            return sendMessage(greeting);
        }
        // ==============================
        // RAG Flow
        // ==============================
        const ragResult = await (0, ragEngine_1.ragEngine)(userMessage);
        if (ragResult.shouldEscalate) {
            await (0, whatsappUserService_1.markPendingEscalation)(user.uuid, userMessage);
            return sendMessage(`Hmm 🤔 I may not fully understand your question.

Could you clarify a bit more?

If you'd prefer, I can escalate your question to a facilitator.

Reply YES or NO.`);
        }
        const friendlyAnswer = ragResult.answer?.trim() ??
            "Hello! 😊 How can I help you today?";
        console.log(`💡 RAG answer for ${userPhone}: ${friendlyAnswer}`);
        return sendMessage(friendlyAnswer);
    }
    catch (error) {
        console.error("❌ WhatsApp webhook error:", error);
        messagingResponse.message(`Sorry 😥 Something went wrong on my side.
Please try again in a moment.`);
        return res.type("text/xml").send(messagingResponse.toString());
    }
}
