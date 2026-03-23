"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWhatsAppUser = registerWhatsAppUser;
exports.markPendingEscalation = markPendingEscalation;
exports.clearPendingEscalation = clearPendingEscalation;
exports.getWhatsAppUser = getWhatsAppUser;
exports.setPendingConfirmation = setPendingConfirmation;
exports.clearPendingConfirmation = clearPendingConfirmation;
const db_1 = __importDefault(require("../config/db"));
const role_1 = require("../types/role");
async function registerWhatsAppUser(rawPhone, role = role_1.Role.Learner) {
    const phone = rawPhone.replace(/^whatsapp:/, "").trim();
    const result = await db_1.default.query(`
    INSERT INTO whatsapp_users (phone, role, firstseen, lastseen, pending_escalation)
    VALUES ($1, $2, NOW(), NOW(), FALSE)
    ON CONFLICT (phone)
    DO UPDATE SET
      lastseen = NOW(),
      role = EXCLUDED.role
    RETURNING uuid, phone, role, firstseen, lastseen,
              pending_escalation AS "pendingEscalation",
              pending_message AS "pendingMessage",
              pending_confirmation_query_id As "pendingConfirmationQueryId"
    `, [phone, role]);
    return result.rows[0];
}
async function markPendingEscalation(uuid, message) {
    await db_1.default.query(`
    UPDATE whatsapp_users
    SET pending_escalation = TRUE,
        pending_message = $2,
        lastseen = NOW()
    WHERE uuid = $1
    `, [uuid, message]);
}
async function clearPendingEscalation(uuid) {
    await db_1.default.query(`
    UPDATE whatsapp_users
    SET pending_escalation = FALSE,
        pending_message = NULL,
        lastseen = NOW()
    WHERE uuid = $1
    `, [uuid]);
}
async function getWhatsAppUser(uuid) {
    const res = await db_1.default.query(`
    SELECT uuid, phone, role, firstseen, lastseen,
           pending_escalation AS "pendingEscalation",
           pending_message AS "pendingMessage"
    FROM whatsapp_users
    WHERE uuid = $1
    `, [uuid]);
    return res.rows[0] ?? null;
}
async function setPendingConfirmation(userUuid, queryId) {
    await db_1.default.query(`
    UPDATE whatsapp_users
    SET pending_confirmation_query_id = $1
    WHERE uuid = $2
    `, [queryId, userUuid]);
}
async function clearPendingConfirmation(userUuid) {
    await db_1.default.query(`
    UPDATE whatsapp_users
    SET pending_confirmation_query_id = NULL
    WHERE uuid = $1
    `, [userUuid]);
}
