import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { getTeamMemberOverview } from "../controllers/team-member-overview.controller.js";

const router = Router();

router.get("/", authenticate, requireRole(Role.TEAM_MEMBER), getTeamMemberOverview);

export default router;
