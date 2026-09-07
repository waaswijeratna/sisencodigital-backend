import type { Response } from "express";

import type { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createReport as createReportService,
  deleteDraftReport as deleteDraftReportService,
  forceDeleteReport as forceDeleteReportService,
  submitReport as submitReportService,
  updateDraftReport as updateDraftReportService,
  reviewReport as reviewReportService
} from "../services/report.service.js";
import { ReviewAction, TaskPriority, TaskStatus } from "../../generated/prisma/enums.js";

const isValidEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] =>
  typeof value === "string" && Object.values(enumObj).includes(value as T[keyof T]);

const isValidPercentage = (value: unknown): value is number =>
  typeof value === "number" && value >= 0 && value <= 100;

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && value >= 0;

const validateReportContent = (body: Record<string, any>) => {
  const {
    tasksCompleted,
    nextWeekTasks,
    blockers,
    achievements
  } = body;

  if (tasksCompleted !== undefined) {
    if (!Array.isArray(tasksCompleted)) {
      return "tasksCompleted must be an array";
    }

    for (const task of tasksCompleted) {
      if (!task?.taskName || typeof task.taskName !== "string") {
        return "Each completed task needs a taskName";
      }
      if (!isValidEnumValue(TaskPriority, task.priority)) {
        return "Each completed task needs a valid priority";
      }
      if (!isValidEnumValue(TaskStatus, task.status)) {
        return "Each completed task needs a valid status: NOT_STARTED, IN_PROGRESS, COMPLETED, or BLOCKED";
      }
      if (
        !isValidPercentage(task.plannedPercentage) ||
        !isValidPercentage(task.actualPercentage)
      ) {
        return "Task percentages must be numbers between 0 and 100";
      }
      if (!isNonNegativeNumber(task.plannedHours) || !isNonNegativeNumber(task.spentHours)) {
        return "Task hours must be non-negative numbers";
      }
    }
  }

  if (nextWeekTasks !== undefined) {
    if (!Array.isArray(nextWeekTasks)) {
      return "nextWeekTasks must be an array";
    }
    for (const task of nextWeekTasks) {
      if (!task?.taskName || typeof task.taskName !== "string") {
        return "Each planned task needs a taskName";
      }
    }
  }

  if (blockers !== undefined) {
    if (!Array.isArray(blockers)) {
      return "blockers must be an array";
    }
    for (const blocker of blockers) {
      if (!blocker?.description || typeof blocker.description !== "string") {
        return "Each blocker needs a description";
      }
    }
    if (blockers.filter((blocker: any) => blocker.isKeyIssue).length > 1) {
      return "Only one blocker can be flagged as the key issue";
    }
  }

  if (achievements !== undefined) {
    if (!Array.isArray(achievements)) {
      return "achievements must be an array";
    }
    for (const achievement of achievements) {
      if (!achievement?.description || typeof achievement.description !== "string") {
        return "Each achievement needs a description";
      }
    }
    if (achievements.filter((achievement: any) => achievement.isKeyAchievement).length > 1) {
      return "Only one achievement can be flagged as the key achievement";
    }
  }

  return null;
};

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

export const submitReport = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
 
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid report id" });
    }

    const validationError = validateReportContent(req.body ?? {});

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
 
    const report = await submitReportService(id, req.user!.userId, req.body ?? {});
 
    return res.status(200).json({
      message: "Report submitted for review",
      report
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Report not found") {
        return res.status(404).json({ message: error.message });
      }
 
      if (error.message === "You can only submit your own reports") {
        return res.status(403).json({ message: error.message });
      }
 
      if (
        error.message.startsWith("Cannot submit a report with status") ||
        error.message === "Report has no version to submit" ||
        error.message === "Add at least one completed task before submitting" ||
        error.message === "Add at least one task planned for next week before submitting" ||
        error.message === "Only reports needing correction can be updated"
      ) {
        return res.status(400).json({ message: error.message });
      }

      if (
        error.message === "Only one blocker can be flagged as the key issue" ||
        error.message === "Only one achievement can be flagged as the key achievement"
      ) {
        return res.status(400).json({ message: error.message });
      }
    }
 
    console.error(error);
 
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDraftReport = async (req: AuthRequest, res: Response) => {
  const reportId = Number(req.params.id);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    return res.status(400).json({ message: "Invalid report id" });
  }

  const validationError = validateReportContent(req.body ?? {});

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const report = await updateDraftReportService(
      reportId,
      req.user!.userId,
      req.body ?? {}
    );

    return res.status(200).json({
      message: "Draft report updated successfully",
      report
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Report not found") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "You can only update your own reports") {
        return res.status(403).json({ message: error.message });
      }

      if (error.message === "Only draft reports can be updated") {
        return res.status(409).json({ message: error.message });
      }
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const reviewReport = async (req: AuthRequest, res: Response) => {
  const reportId = parseReportId(req.params.id);

  if (reportId === null) {
    return res.status(400).json({ message: "Invalid report id" });
  }

  const { action, comment } = req.body ?? {};

  if (action !== ReviewAction.APPROVED && action !== ReviewAction.REQUESTED_CHANGES) {
    return res.status(400).json({
      message: "action must be APPROVED or REQUESTED_CHANGES"
    });
  }

  if (comment !== undefined && typeof comment !== "string") {
    return res.status(400).json({ message: "comment must be a string" });
  }

  if (action === ReviewAction.REQUESTED_CHANGES && !comment?.trim()) {
    return res.status(400).json({
      message: "A comment is required when requesting changes"
    });
  }

  try {
    const report = await reviewReportService(
      reportId,
      req.user!.userId,
      action,
      comment
    );

    return res.status(200).json({
      message:
        action === ReviewAction.APPROVED
          ? "Report approved successfully"
          : "Changes requested for report",
      report
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Report not found") {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message === "Only submitted reports can be reviewed" ||
        error.message === "Report has no version to review"
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