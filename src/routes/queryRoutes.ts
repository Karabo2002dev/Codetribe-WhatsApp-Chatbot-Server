import { Role } from "../types/role";
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/authMiddleware";
import { roleAuth } from "../middlewares/roleMiddleware";
import { getAllQueries, getAssignedQueries, getQueryById } from "../controllers/queryController";
import { fetchQueryStats } from "../controllers/queryStatsController";
import { fetchQueryTrend } from "../controllers/queryTrendController";
import { respondToQueryController } from "../controllers/queryController";

const router = Router();

router.get(
  "/",
  verifyFirebaseToken,
  roleAuth([Role.Admin, Role.Facilitator]),
  getAllQueries
);

router.get("/:id", verifyFirebaseToken, roleAuth([Role.Admin, Role.Facilitator]), getQueryById);
router.get("/assigned/facilitator", verifyFirebaseToken, roleAuth([Role.Facilitator]), getAssignedQueries);
router.get("/stats", verifyFirebaseToken, roleAuth([Role.Admin]), fetchQueryStats)
router.get("/trend", verifyFirebaseToken, roleAuth([Role.Admin]), fetchQueryTrend)
router.post("/respond", verifyFirebaseToken, roleAuth([Role.Facilitator]), respondToQueryController);



export default router;
