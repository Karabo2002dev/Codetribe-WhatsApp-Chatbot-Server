import { Role } from "../types/role";
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/authMiddleware";
import { roleAuth } from "../middlewares/roleMiddleware";
import { getAllQueries } from "../controllers/queryController";
import { fetchQueryStats } from "../controllers/queryStatsController";

const router = Router();

router.get(
  "/",
  verifyFirebaseToken,
  roleAuth([Role.Admin, Role.Facilitator]),
  getAllQueries
);

router.get("/stats", verifyFirebaseToken, roleAuth([Role.Admin]), fetchQueryStats)

export default router;
