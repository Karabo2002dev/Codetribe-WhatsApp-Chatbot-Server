import { Request, Response, NextFunction } from "express";
import { getQueryStats } from "../services/queryServicesStats";

export async function fetchQueryStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getQueryStats();

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Query statistics not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query statistics fetched successfully",
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching query stats:", error);

    next(error);
  }
}