import { Request } from "express";
import { Role } from "./role";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    uid: string;
    phoneNumber?: string;
    email?: string;
    fullname?: string;
    phone_number ?: string;
    role: Role;  
  };
}
