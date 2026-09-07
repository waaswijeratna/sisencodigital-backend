import { Router } from "express";

import { Role } from "../../generated/prisma/enums.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import {
	createReport,
	deleteDraftReport,
	forceDeleteReport,
	submitReport,
	updateDraftReport,
	reviewReport
} from "../controllers/report.controller.js";
import {
	getReports,
	getReportById
} from "../controllers/team-member-report.controller.js";

const router = Router();

router.use(authenticate);

// only team members create their own reports
router.get("/", getReports);
router.get("/:id", getReportById);
router.post("/", requireRole(Role.TEAM_MEMBER), createReport);
router.delete("/:id", requireRole(Role.TEAM_MEMBER), deleteDraftReport);
router.patch("/:id", requireRole(Role.TEAM_MEMBER), updateDraftReport);
router.patch("/:id/submit", requireRole(Role.TEAM_MEMBER), submitReport);
router.patch("/:id/review", requireRole(Role.ADMIN), reviewReport);
router.delete("/:id/admin-force", requireRole(Role.ADMIN), forceDeleteReport);

export default router;