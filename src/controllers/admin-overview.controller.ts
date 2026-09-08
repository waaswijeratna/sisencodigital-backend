import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { getAdminOverview as getAdminOverviewService } from "../services/admin-overview.service.js";

export const getAdminOverview = async (_req: AuthRequest, res: Response) => {
  try {
    const overview = await getAdminOverviewService();
    return res.status(200).json({ overview });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};