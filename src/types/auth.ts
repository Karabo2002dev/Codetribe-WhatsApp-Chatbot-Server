import { Request } from "express";
import { Role } from "./role";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: Role;  
  };
}
