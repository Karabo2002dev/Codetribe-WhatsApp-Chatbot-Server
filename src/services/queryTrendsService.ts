import pool from "../config/db";

export async function getMonthlyQueryTrend(month: string) {
  const result = await pool.query(
    `
   WITH month_days AS (
  SELECT generate_series(3, 30, 3) AS bucket_day
),
monthly_queries AS (
  SELECT DATE(created_at) AS query_date
  FROM queries
  WHERE DATE_TRUNC('month', created_at) =
        DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM'))
),
bucketed AS (
  SELECT
    CAST(
      ((EXTRACT(DAY FROM query_date) - 1) / 3) * 3 + 3
    AS INT) AS bucket_day,
    COUNT(*) AS query_count
  FROM monthly_queries
  GROUP BY bucket_day
),
total AS (
  SELECT COUNT(*) AS total_queries FROM monthly_queries
)
SELECT
  md.bucket_day,
  COALESCE(
    ROUND((b.query_count::decimal / NULLIF(t.total_queries, 0)) * 100, 2),
    0
  ) AS percentage
FROM month_days md
LEFT JOIN bucketed b ON md.bucket_day = b.bucket_day
CROSS JOIN total t
ORDER BY md.bucket_day;
    `,
    [`${month}`],
  );

  return result.rows;
}
