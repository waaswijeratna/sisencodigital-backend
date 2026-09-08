import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  getTeamMembers
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);
router.get("/team-members", authenticate, requireRole(Role.ADMIN), getTeamMembers);

export default router;