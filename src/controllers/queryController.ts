import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth";
import * as QueryService from "../services/queryService";


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




