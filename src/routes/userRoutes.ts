import { Role } from "../types/role";
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/authMiddleware";
import { roleAuth } from "../middlewares/roleMiddleware";
import {
  fetchAllUsers,
  fetchProfile,
  editProfile,
  removeProfile,
} from "../controllers/userController";

const router = Router();

router.get("/", verifyFirebaseToken, roleAuth([Role.Admin]), fetchAllUsers);

router.get("/profile", verifyFirebaseToken, roleAuth([Role.Admin, Role.Facilitator]), fetchProfile);
router.put("/profile", verifyFirebaseToken, roleAuth([Role.Admin, Role.Facilitator]), editProfile);
router.delete("/profile", verifyFirebaseToken, roleAuth([Role.Admin, Role.Facilitator]), removeProfile);

export default router;