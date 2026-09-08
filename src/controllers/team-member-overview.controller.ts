import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { getTeamMemberOverview as getTeamMemberOverviewService } from "../services/team-member-overview.service.js";

export const getTeamMemberOverview = async (req: AuthRequest, res: Response) => {
  try {
    const overview = await getTeamMemberOverviewService(req.user!.userId);
    return res.status(200).json({ overview });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
