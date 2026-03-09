import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import {
  getAllUsers,
  getProfileById,
  updateProfile,
  deleteProfile,
} from "../services/userService";


export async function fetchAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

export async function editProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
   const userId=req.user?.id;
    const { fullName, email, phoneNumber } = req.body;

    const updated = await updateProfile(userId, {
      fullName,
      email,
      phoneNumber,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
     const userId=req.user?.id;

    const deleted = await deleteProfile(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}