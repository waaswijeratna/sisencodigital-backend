import { Router } from "express";

import { Role } from "../../generated/prisma/enums.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import {
	createReport,
	deleteDraftReport,
	forceDeleteReport
} from "../controllers/report.controller.js";

const router = Router();

router.use(authenticate);

// only team members create their own reports
router.post("/", requireRole(Role.TEAM_MEMBER), createReport);
router.delete("/:id", requireRole(Role.TEAM_MEMBER), deleteDraftReport);
router.delete("/:id/admin-force", requireRole(Role.ADMIN), forceDeleteReport);

export default router;