import { Role } from "../types/role";
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/authMiddleware";
import { roleAuth } from "../middlewares/roleMiddleware";
import { fetchAllUsers } from "../controllers/userController";

const router = Router();

router.get("/", verifyFirebaseToken, roleAuth([Role.Admin]), fetchAllUsers);

export default router;