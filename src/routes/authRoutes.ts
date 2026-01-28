import express from "express";
import {
  register,
  login,
} from "../controllers/authController";
import { registerValidator, loginValidator } from "./validators/authValidator";

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

export default router;
