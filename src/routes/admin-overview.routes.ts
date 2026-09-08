import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { getAdminOverview } from "../controllers/admin-overview.controller.js";

const router = Router();

router.get("/", authenticate, requireRole(Role.ADMIN), getAdminOverview);

export default router;