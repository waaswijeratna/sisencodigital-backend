import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";

const router = Router();

// Any authenticated user can view projects (for tagging reports)
router.get("/", authenticate, getProjects);
router.get("/:id", authenticate, getProject);

// Only managers/admins can manage projects
router.post("/", authenticate, requireRole(Role.ADMIN), createProject);
router.put("/:id", authenticate, requireRole(Role.ADMIN), updateProject);
router.delete("/:id", authenticate, requireRole(Role.ADMIN), deleteProject);

export default router;