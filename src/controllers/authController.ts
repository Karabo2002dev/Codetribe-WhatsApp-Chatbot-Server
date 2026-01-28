import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role, fullName, phoneNumber } = req.body;

    const user = await authService.register(
      email,
      password,
      phoneNumber,
      fullName,
      role
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (err) {
    next(err); // 🔥 send to global error handler
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await authService.login(token);

    res.status(200).json({
      message: 'Login successful',
      user,
    });
  } catch (err) {
    next(err);
  }
};
