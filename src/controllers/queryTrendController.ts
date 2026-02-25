import { Request, Response, NextFunction } from "express";
import { getMonthlyQueryTrend } from "../services/queryTrendsService";

export async function fetchQueryTrend(req: Request, res: Response, next : NextFunction ) {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });
    }

    const trend = await getMonthlyQueryTrend(month as string);

    res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error)
  }
}
