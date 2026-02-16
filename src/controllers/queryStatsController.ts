import { Request, Response, NextFunction } from "express";
import { getQueryStats } from "../services/queryServicesStats";

export async function fetchQueryStats(req: Request, res: Response , next : NextFunction) {
  try {
    const stats = await getQueryStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error)
  }
}
