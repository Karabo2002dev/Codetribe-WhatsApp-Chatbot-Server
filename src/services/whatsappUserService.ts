import pool from "../config/db";
import { Role } from "../types/role";

export type WhatsAppUser = {
  uuid: string;
  phone: string;
  role: Role
  firstseen: Date;
  lastseen: Date;
  pendingEscalation?: boolean;
  pendingMessage?: string | null;
  pendingConfirmationQueryId?: string | null;
};

export async function registerWhatsAppUser(
  rawPhone: string,
  role: Role = Role.Learner
): Promise<WhatsAppUser> {
  const phone = rawPhone.replace(/^whatsapp:/, "").trim();

  const result = await pool.query<WhatsAppUser>(
    `
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
    `,
    [phone, role]
  );

  return result.rows[0];
}

export async function markPendingEscalation(uuid: string, message: string) {
  await pool.query(
    `
    UPDATE whatsapp_users
    SET pending_escalation = TRUE,
        pending_message = $2,
        lastseen = NOW()
    WHERE uuid = $1
    `,
    [uuid, message]
  );
}

export async function clearPendingEscalation(uuid: string) {
  await pool.query(
    `
    UPDATE whatsapp_users
    SET pending_escalation = FALSE,
        pending_message = NULL,
        lastseen = NOW()
    WHERE uuid = $1
    `,
    [uuid]
  );
}

export async function getWhatsAppUser(uuid: string): Promise<WhatsAppUser | null> {
  const res = await pool.query<WhatsAppUser>(
    `
    SELECT uuid, phone, role, firstseen, lastseen,
           pending_escalation AS "pendingEscalation",
           pending_message AS "pendingMessage"
    FROM whatsapp_users
    WHERE uuid = $1
    `,
    [uuid]
  );
  return res.rows[0] ?? null;
}

export async function setPendingConfirmation(userUuid: string, queryId: string | string[]) {
  await pool.query(
    `
    UPDATE whatsapp_users
    SET pending_confirmation_query_id = $1
    WHERE uuid = $2
    `,
    [queryId, userUuid]
  );
}

export async function clearPendingConfirmation(userUuid: string) {
  await pool.query(
    `
    UPDATE whatsapp_users
    SET pending_confirmation_query_id = NULL
    WHERE uuid = $1
    `,
    [userUuid]
  );
}