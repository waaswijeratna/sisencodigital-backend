import type { Response } from "express";

import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";
import { parseReportFilters } from "../lib/report-filters.js";
import {
  getTeamMemberReports,
  getTeamMemberReportById
} from "../services/team-member-report.service.js";

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const filters = parseReportFilters(req.query);
    const reports = await getTeamMemberReports(
      req.user!.role === Role.TEAM_MEMBER ? req.user!.userId : undefined,
      filters
    );

    return res.status(200).json({ reports });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid report")) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error && error.message === "fromDate cannot be after toDate") {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  const reportId = Number(req.params.id);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    return res.status(400).json({ message: "Invalid report id" });
  }

  try {
    const report = await getTeamMemberReportById(
      reportId,
      req.user!.role === Role.TEAM_MEMBER ? req.user!.userId : undefined
    );
    return res.status(200).json({ report });
  } catch (error) {
    if (error instanceof Error && error.message === "Report not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
