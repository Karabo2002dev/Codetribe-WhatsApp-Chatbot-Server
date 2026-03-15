import pool from "../config/db";
import { sendAssignmentEmail } from "./emailService";
import { sendWhatsAppConfirmationMessage } from "./twilioService";
import { setPendingConfirmation } from "./whatsappUserService";


export async function findQueriesByFacilitator(facilitatorId: string | undefined) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      phone,
      question,
      status,
      created_at
    FROM queries
    WHERE handled_by = $1
    ORDER BY created_at DESC
    `,
    [facilitatorId]
  );

  return rows;
}

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
    SELECT
      q.id,
      q.question,
      q.response,
      q.source,
      u.fullname AS fullname,
      q.created_at,
      q.phone,
      q.status
    FROM queries q
    LEFT JOIN users u
      ON q.handled_by = u.id
    ORDER BY q.created_at DESC
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
    SET status = $1
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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const normalizedQueryId = Array.isArray(queryId) ? queryId[0] : queryId;

    const { rows: facilitators } = await client.query(
      `
      SELECT 
        u.id,
        u.email,
        COUNT(q.id) AS active_queries
      FROM users u
      LEFT JOIN queries q 
        ON q.handled_by = u.id
        AND q.status IN ('OPEN','ESCALATED')
      WHERE u.role = 'FACILITATOR'
      GROUP BY u.id, u.email
      HAVING COUNT(q.id) < 20
      ORDER BY active_queries ASC, u.created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
      `
    );

    if (facilitators.length === 0) {
      throw new Error("No facilitator available (all have 20 active queries)");
    }

    const facilitator = facilitators[0];

    const { rows } = await client.query(
      `
      UPDATE queries
      SET handled_by = $1,
          status = 'ESCALATED'
      WHERE id = $2
      RETURNING *
      `,
      [facilitator.id, normalizedQueryId]
    );

    if (rows.length === 0) {
      throw new Error("Query not found");
    }

    await client.query("COMMIT");

    await sendAssignmentEmail(facilitator.email, question, phone);

    console.log(
      `📧 Query ${normalizedQueryId} assigned to ${facilitator.email} (load: ${facilitator.active_queries})`
    );

    return {
      query: rows[0],
      facilitator: {
        id: facilitator.id,
        email: facilitator.email,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function respondToQueryService(
  queryId: string,
  response: string,
) {

  console.log(`Responding to query ${queryId} with response: ${response}`);
  const { rows } = await pool.query(
    `
    UPDATE queries
    SET
      response = $1,
      status = 'RESPONDED'
    WHERE id = $2
    RETURNING phone, user_uuid, id, response;
    `,
    [response, queryId]
  );

  if (!rows.length) throw new Error("Query not found or not assigned");

  const learnerPhone = rows[0].phone;
  const learnerUuid = rows[0].user_uuid;

  await setPendingConfirmation(learnerUuid, queryId);

  await sendWhatsAppConfirmationMessage(
    learnerPhone,
    response
  );

  return { success: true };
}