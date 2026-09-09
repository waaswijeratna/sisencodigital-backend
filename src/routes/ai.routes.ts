import { Router } from "express";
import { chatWithAI } from "../controllers/ai.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";



const router = Router();

router.use(authenticate);


router.post("/chat", requireRole(Role.ADMIN), chatWithAI);

export default router;