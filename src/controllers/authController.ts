import { Request, Response } from "express";
import * as authService from "../services/authService";


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, fullName, phoneNumber } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    if(!fullName) {
        res.status(400).json({ message: "Full name is required" });
        return;
    }

    if(!phoneNumber) {
        res.status(400).json({ message: "Phone number is required" });
        return;
    }

    const user = await authService.register(email, password, phoneNumber, fullName, role);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message || "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: "Token is required" });
      return;
    }

    const user = await authService.login(token);

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (err: any) {
    res.status(401).json({
      message: err.message || "Login failed",
    });
  }
};
