import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

export const roleAuth =
  (allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({
          message: "User role not found"
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
