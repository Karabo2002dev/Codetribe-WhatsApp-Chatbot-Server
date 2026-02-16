import pool from "../config/db";

export async function getQueryStats() {
  const result = await pool.query(`
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
