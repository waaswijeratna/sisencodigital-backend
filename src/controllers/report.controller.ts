import type { Response } from "express";

import type { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createReport as createReportService,
  deleteDraftReport as deleteDraftReportService,
  forceDeleteReport as forceDeleteReportService
} from "../services/report.service.js";
import { TaskPriority, TaskStatus } from "../../generated/prisma/enums.js";

const isValidEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] =>
  typeof value === "string" && Object.values(enumObj).includes(value as T[keyof T]);

const isValidPercentage = (value: unknown): value is number =>
  typeof value === "number" && value >= 0 && value <= 100;

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && value >= 0;

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const {
      projectId,
      weekStart,
      weekEnd,
      tasksCompleted,
      nextWeekTasks,
      blockers,
      achievements,
      hours
    } = req.body ?? {};

    if (!projectId || typeof projectId !== "number") {
      return res.status(400).json({ message: "projectId is required" });
    }

    const parsedWeekStart = new Date(weekStart);
    const parsedWeekEnd = new Date(weekEnd);

    if (!weekStart || Number.isNaN(parsedWeekStart.getTime())) {
      return res.status(400).json({ message: "A valid weekStart date is required" });
    }

    if (!weekEnd || Number.isNaN(parsedWeekEnd.getTime())) {
      return res.status(400).json({ message: "A valid weekEnd date is required" });
    }

    if (parsedWeekEnd < parsedWeekStart) {
      return res.status(400).json({ message: "weekEnd cannot be before weekStart" });
    }

    if (tasksCompleted !== undefined) {
      if (!Array.isArray(tasksCompleted)) {
        return res.status(400).json({ message: "tasksCompleted must be an array" });
      }

      for (const task of tasksCompleted) {
        if (!task.taskName || typeof task.taskName !== "string") {
          return res.status(400).json({ message: "Each completed task needs a taskName" });
        }
        if (!isValidEnumValue(TaskPriority, task.priority)) {
          return res.status(400).json({ message: "Each completed task needs a valid priority" });
        }
        if (!isValidEnumValue(TaskStatus, task.status)) {
          return res.status(400).json({ message: "Each completed task needs a valid status" });
        }
        if (
          !isValidPercentage(task.plannedPercentage) ||
          !isValidPercentage(task.actualPercentage)
        ) {
          return res
            .status(400)
            .json({ message: "Task percentages must be numbers between 0 and 100" });
        }
        if (!isNonNegativeNumber(task.plannedHours) || !isNonNegativeNumber(task.spentHours)) {
          return res.status(400).json({ message: "Task hours must be non-negative numbers" });
        }
      }
    }

    if (nextWeekTasks !== undefined) {
      if (!Array.isArray(nextWeekTasks)) {
        return res.status(400).json({ message: "nextWeekTasks must be an array" });
      }
      for (const task of nextWeekTasks) {
        if (!task.taskName || typeof task.taskName !== "string") {
          return res.status(400).json({ message: "Each planned task needs a taskName" });
        }
      }
    }

    if (blockers !== undefined) {
      if (!Array.isArray(blockers)) {
        return res.status(400).json({ message: "blockers must be an array" });
      }
      for (const blocker of blockers) {
        if (!blocker.description || typeof blocker.description !== "string") {
          return res.status(400).json({ message: "Each blocker needs a description" });
        }
      }
    }

    if (achievements !== undefined) {
      if (!Array.isArray(achievements)) {
        return res.status(400).json({ message: "achievements must be an array" });
      }
      for (const achievement of achievements) {
        if (!achievement.description || typeof achievement.description !== "string") {
          return res.status(400).json({ message: "Each achievement needs a description" });
        }
      }
    }

    const report = await createReportService({
      userId: req.user!.userId,
      projectId,
      weekStart: parsedWeekStart,
      weekEnd: parsedWeekEnd,
      tasksCompleted,
      nextWeekTasks,
      blockers,
      achievements,
      hours
    });

    return res.status(201).json({
      message: "Report saved as draft",
      report
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Project not found") {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message === "Cannot create a report against an inactive project" ||
        error.message === "A report for this week already exists" ||
        error.message === "Only one blocker can be flagged as the key issue" ||
        error.message === "Only one achievement can be flagged as the key achievement"
      ) {
        return res.status(409).json({ message: error.message });
      }
    }

    console.error(error);

    return res.status(500).json({ message: "Internal server error" });
  }
};

const parseReportId = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const reportId = Number(value);

  return Number.isInteger(reportId) && reportId > 0 ? reportId : null;
};

export const deleteDraftReport = async (req: AuthRequest, res: Response) => {
  const reportId = parseReportId(req.params.id);

  if (reportId === null) {
    return res.status(400).json({ message: "Invalid report id" });
  }

  try {
    await deleteDraftReportService(reportId, req.user!.userId);

    return res.status(200).json({
      message: "Draft report deleted successfully"
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Report not found") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "Report does not belong to this user") {
        return res.status(403).json({ message: "Access denied" });
      }

      if (error.message === "Only draft reports can be deleted") {
        return res.status(409).json({ message: error.message });
      }
    }

    console.error(error);

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forceDeleteReport = async (req: AuthRequest, res: Response) => {
  const reportId = parseReportId(req.params.id);

  if (reportId === null) {
    return res.status(400).json({ message: "Invalid report id" });
  }

  try {
    await forceDeleteReportService(reportId);

    return res.status(200).json({
      message: "Report force-deleted successfully"
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Report not found") {
      return res.status(404).json({ message: error.message });
    }

    console.error(error);

    return res.status(500).json({ message: "Internal server error" });
  }
};