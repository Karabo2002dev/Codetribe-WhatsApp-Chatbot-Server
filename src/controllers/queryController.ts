import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth";
import * as QueryService from "../services/queryService";
import {
  findQueriesByFacilitator,
  respondToQueryService,
} from "../services/queryService";

export async function getAssignedQueries(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const facilitatorId = req.user?.id;

    if (!facilitatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: facilitator ID is missing",
      });
    }

    console.log(`Fetching queries for facilitator ID: ${facilitatorId}`);

    const result = await findQueriesByFacilitator(facilitatorId);

    res.status(200).json({
      success: true,
      message: "Assigned queries fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export const getAllQueries = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queries = await QueryService.getAllQueries();

    res.status(200).json({
      success: true,
      message: "Queries fetched successfully",
      data: queries,
    });
  } catch (error) {
    next(error);
  }
};

export const getQueryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Query ID is required",
      });
    }

    const query = await QueryService.getQueryById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query fetched successfully",
      data: query,
    });
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
    const facilitatorId = req.user?.id;

    if (!facilitatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: facilitator ID is missing",
      });
    }

    if (!queryId) {
      return res.status(400).json({
        success: false,
        message: "Query ID is required",
      });
    }

    if (!response || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: "Response is required",
      });
    }

    const query = await QueryService.getQueryById(queryId);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    await respondToQueryService(queryId, response);

    res.status(200).json({
      success: true,
      message: "Response sent to learner successfully",
    });
  } catch (err: any) {
    if (err.message === "QUERY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    if (err.message === "UNAUTHORIZED_FACILITATOR") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to respond to this query",
      });
    }

    next(err);
  }
}