import { Router } from "express";
import { getAdminDoc, saveAdminDoc  } from "../controllers/adminDocController";
import { verifyFirebaseToken } from "../middlewares/authMiddleware";
import { roleAuth } from "../middlewares/roleMiddleware";
import { Role } from "../types/role";

const router = Router();

router.get("/doc", verifyFirebaseToken, roleAuth([Role.Admin]), getAdminDoc);
router.post("/doc", verifyFirebaseToken, roleAuth([Role.Admin]), saveAdminDoc);

export default router;