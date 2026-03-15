import { Request, Response, NextFunction } from "express";
import { getMonthlyQueryTrend } from "../services/queryTrendsService";

export async function fetchQueryTrend(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { month } = req.query;

    if (!month || typeof month !== "string") {
      return res.status(400).json({
        success: false,
        message: "Month is required in the format YYYY-MM",
      });
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Use YYYY-MM",
      });
    }

    const trend = await getMonthlyQueryTrend(month);

    if (!trend) {
      return res.status(404).json({
        success: false,
        message: "No query trend data found for the selected month",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query trend fetched successfully",
      data: trend,
    });
  } catch (error) {
    console.error("Error fetching query trend:", error);
    next(error);
  }
}