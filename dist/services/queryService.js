"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQueryStatus = exports.getQueryById = exports.getAllQueries = void 0;
exports.findQueriesByFacilitator = findQueriesByFacilitator;
exports.escalateQuery = escalateQuery;
exports.assignQueryToFreeFacilitator = assignQueryToFreeFacilitator;
exports.respondToQueryService = respondToQueryService;
exports.notifyAssignedFacilitatorForFollowUp = notifyAssignedFacilitatorForFollowUp;
const db_1 = __importDefault(require("../config/db"));
const emailService_1 = require("./emailService");
const twilioService_1 = require("./twilioService");
const whatsappUserService_1 = require("./whatsappUserService");
async function findQueriesByFacilitator(facilitatorId) {
    const { rows } = await db_1.default.query(`
    SELECT
      id,
      phone,
      question,
      status,
      created_at
    FROM queries
    WHERE handled_by = $1
    ORDER BY created_at DESC
    `, [facilitatorId]);
    return rows;
}
async function escalateQuery(userUuid, phone, question, status = "OPEN", source = "WHATSAPP") {
    const { rows } = await db_1.default.query(`
    INSERT INTO queries (user_uuid, phone, question, status, source)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `, [userUuid, phone, question, status, source]);
    if (rows.length === 0) {
        throw new Error("Failed to escalate query");
    }
    return rows[0];
}
const getAllQueries = async () => {
    const { rows } = await db_1.default.query(`
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
exports.getAllQueries = getAllQueries;
const getQueryById = async (id) => {
    const { rows } = await db_1.default.query(`SELECT * FROM queries WHERE id = $1`, [
        id,
    ]);
    return rows[0];
};
exports.getQueryById = getQueryById;
const updateQueryStatus = async (id, status) => {
    const { rows } = await db_1.default.query(`
    UPDATE queries
    SET status = $1
    WHERE id = $2
    RETURNING *
    `, [status, id]);
    return rows[0];
};
exports.updateQueryStatus = updateQueryStatus;
async function assignQueryToFreeFacilitator(queryId, question, phone) {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        const normalizedQueryId = Array.isArray(queryId) ? queryId[0] : queryId;
        const { rows: facilitators } = await client.query(`
      SELECT
        u.id,
        u.email,
        (
          SELECT COUNT(*)
          FROM queries q
          WHERE q.handled_by = u.id
            AND q.status IN ('OPEN', 'ESCALATED')
        ) AS active_queries
      FROM users u
      WHERE u.role = 'FACILITATOR'
        AND (
          SELECT COUNT(*)
          FROM queries q
          WHERE q.handled_by = u.id
            AND q.status IN ('OPEN', 'ESCALATED')
        ) < 20
      ORDER BY u.created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
      `);
        if (facilitators.length === 0) {
            throw new Error("No facilitator available (all have 20 active queries)");
        }
        const facilitator = facilitators[0];
        const { rows } = await client.query(`
      UPDATE queries
      SET handled_by = $1,
          status = 'ESCALATED'
      WHERE id = $2
      RETURNING *
      `, [facilitator.id, normalizedQueryId]);
        if (rows.length === 0) {
            throw new Error("Query not found");
        }
        await client.query("COMMIT");
        await (0, emailService_1.sendAssignmentEmail)(facilitator.email, question, phone);
        console.log(`📧 Query ${normalizedQueryId} assigned to ${facilitator.email} (load: ${facilitator.active_queries})`);
        return {
            query: rows[0],
            facilitator: {
                id: facilitator.id,
                email: facilitator.email,
            },
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function respondToQueryService(queryId, response) {
    console.log(`Responding to query ${queryId} with response: ${response}`);
    const { rows } = await db_1.default.query(`
    UPDATE queries
    SET
      response = $1,
      status = 'RESPONDED'
    WHERE id = $2
    RETURNING phone, user_uuid, id, response;
    `, [response, queryId]);
    if (!rows.length)
        throw new Error("Query not found or not assigned");
    const learnerPhone = rows[0].phone;
    const learnerUuid = rows[0].user_uuid;
    await (0, whatsappUserService_1.setPendingConfirmation)(learnerUuid, queryId);
    await (0, twilioService_1.sendWhatsAppConfirmationMessage)(learnerPhone, response);
    return { success: true };
}
async function notifyAssignedFacilitatorForFollowUp(queryId, learnerPhone) {
    const { rows } = await db_1.default.query(`
    SELECT
      q.id,
      q.question,
      q.status,
      u.id AS facilitator_id,
      u.email AS facilitator_email
    FROM queries q
    INNER JOIN users u
      ON u.id = q.handled_by
    WHERE q.id = $1
    LIMIT 1
    `, [queryId]);
    if (rows.length === 0) {
        console.warn(`No assigned facilitator found for query ${queryId}`);
        return null;
    }
    const query = rows[0];
    await (0, emailService_1.sendFollowUpEmail)(query.facilitator_email, query.question, learnerPhone);
    return {
        queryId: query.id,
        facilitator: {
            id: query.facilitator_id,
            email: query.facilitator_email,
        },
    };
}
