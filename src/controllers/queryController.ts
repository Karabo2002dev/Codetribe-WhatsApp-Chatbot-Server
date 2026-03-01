import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth";
import * as QueryService from "../services/queryService";
import { findQueriesByFacilitator, respondToQueryService } from "../services/queryService";

export async function getAssignedQueries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const facilitatorId = req.user?.id;
    console.log(`Fetching queries for facilitator ID: ${facilitatorId}`);

    const result = await findQueriesByFacilitator(facilitatorId);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
     next(error);
  }
}


export const getAllQueries = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const queries = await QueryService.getAllQueries();
    res.json(queries);
  } catch (error) {
    next(error);
  }
};

export const getQueryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const query = await QueryService.getQueryById(id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    res.json(query);
  } catch (error) {
    next(error);
  }
};

export async function respondToQueryController(
  req: AuthRequest,
  res: Response,
  next: NextFunction 
) {
  try {
    
    const { response, queryId } = req.body;
    const facilitatorId = req.user?.id; // from auth middleware

    if (!response) {
      return res.status(400).json({ message: "Response is required" });
    }

    await respondToQueryService(
      queryId,
      response,
    );

    res.json({ success: true, message: "Response sent to learner" });
  } catch (err) {
    next(err);
    
  }
}





