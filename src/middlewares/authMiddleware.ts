import { NextFunction, Response } from "express";
import admin from "../config/firebase";
import { AuthRequest } from "../types/auth";
import pool from "../config/db";

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const { rows } = await pool.query(
      "SELECT role FROM users WHERE firebase_uid = $1",
      [decoded.uid]
    );

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: rows[0]?.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
