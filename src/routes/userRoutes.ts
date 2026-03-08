import { Role } from "../types/role";
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/authMiddleware";
import { roleAuth } from "../middlewares/roleMiddleware";
import {
  fetchAllUsers,
  editProfile,
  removeProfile,
} from "../controllers/userController";

const router = Router();

router.get("/", verifyFirebaseToken, roleAuth([Role.Admin]), fetchAllUsers);

router.get("/users", fetchAllUsers);
router.put("/profile/:id", editProfile);
router.delete("/profile/:id", removeProfile);

export default router;