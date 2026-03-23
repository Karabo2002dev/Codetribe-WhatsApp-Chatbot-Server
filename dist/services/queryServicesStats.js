"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryStats = getQueryStats;
const db_1 = __importDefault(require("../config/db"));
async function getQueryStats() {
    const result = await db_1.default.query(`
    SELECT
      COUNT(*) AS total_queries,
      COUNT(*) FILTER (WHERE status IN ('OPEN', 'ESCALATED')) AS opened_queries,
      COUNT(*) FILTER (WHERE status = 'RESOLVED') AS resolved_queries
    FROM queries
  `);
    return {
        totalQueries: Number(result.rows[0].total_queries),
        openedQueries: Number(result.rows[0].opened_queries),
        resolvedQueries: Number(result.rows[0].resolved_queries),
    };
}
