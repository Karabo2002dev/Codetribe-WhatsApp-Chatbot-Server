import pool from "../config/db";
import { sendAssignmentEmail } from "./emailService";

export async function escalateQuery(
  userUuid: string,
  phone: string,
  question: string,
  status: string = "OPEN",
  source: string = "WHATSAPP",
) {
  const { rows } = await pool.query(
    `
    INSERT INTO queries (user_uuid, phone, question, status, source)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [userUuid, phone, question, status, source],
  );

  if (rows.length === 0) {
    throw new Error("Failed to escalate query");
  }

  return rows[0];
}

export const getAllQueries = async () => {
  const { rows } = await pool.query(`
    SELECT * FROM queries
  `);

  return rows;
};

export const getQueryById = async (id: string | string[]) => {
  const { rows } = await pool.query(`SELECT * FROM queries WHERE id = $1`, [
    id,
  ]);

  return rows[0];
};

export const updateQueryStatus = async (
  id: string | string[],
  status: string,
) => {
  const { rows } = await pool.query(
    `
    UPDATE queries
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [status, id],
  );

  return rows[0];
};

export async function assignQueryToFreeFacilitator(
  queryId: string,
  question: string,
  phone: string,
) {

  const normalizedQueryId = Array.isArray(queryId) ? queryId[0] : queryId;

  const { rows: freeFacilitators } = await pool.query(`
    SELECT u.id, u.email
    FROM users u
    WHERE u.role = 'FACILITATOR'
      AND NOT EXISTS (
        SELECT 1
        FROM queries q
        WHERE q.handled_by = u.id
          AND q.status IN ('OPEN', 'ESCALATED')
      )
    ORDER BY u.created_at ASC
    LIMIT 1
  `);

  if (!freeFacilitators || freeFacilitators.length === 0) {
    throw new Error("No free facilitator available for assignment");
  }

  const facilitator = freeFacilitators[0];

  const { rows } = await pool.query(
    `
    UPDATE queries
    SET handled_by = $1,
        status = 'ESCALATED'
    WHERE id = $2
    RETURNING *
    `,
    [facilitator.id, normalizedQueryId],
  );

  if (rows.length === 0) {
    throw new Error("Query not found");
  }

  await sendAssignmentEmail(facilitator.email, question, phone);
  console.log(
    `📧 Assigned query ${normalizedQueryId} sent to ${facilitator.email}`,
  );

  return {
    query: rows[0],
    facilitator: {
      id: facilitator.id,
      uuid: facilitator.uuid,
      email: facilitator.email,
    },
  };
}
