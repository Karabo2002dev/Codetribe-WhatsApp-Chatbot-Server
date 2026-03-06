import { Request, Response, NextFunction } from "express";
import { getAllUsers } from "../services/userService";

export async function fetchAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}