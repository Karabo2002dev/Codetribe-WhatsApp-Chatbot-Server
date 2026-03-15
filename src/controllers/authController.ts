import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role, fullName, phoneNumber } = req.body;

    // Input validation
    if (!email || !password || !role || !fullName || !phoneNumber) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    const user = await authService.register(
      email,
      password,
      phoneNumber,
      fullName,
      role
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err: any) {
    // Known service errors
    if (err.message === "USER_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    next(err); // pass unexpected errors to global handler
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    // Validate input
    if (!token) {
      res.status(400).json({
        success: false,
        message: "Authentication token is required",
      });
      return;
    }

    const user = await authService.login(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (err: any) {
    if (err.message === "INVALID_TOKEN") {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    next(err);
  }
};