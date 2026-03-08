import { Request } from "express";
import { Role } from "./role";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    uid: string;
    email?: string;
    fullname?: string;
    phone_number ?: string;
    role: Role;  
  };
}
