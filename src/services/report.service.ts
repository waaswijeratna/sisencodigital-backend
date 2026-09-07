import prisma from "../lib/prisma.js";
import {
  ReportStatus,
  TaskPriority,
  TaskStatus
} from "../../generated/prisma/enums.js";

interface TaskCompletedInput {
  taskName: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  plannedHours: number;
  spentHours: number;
  deliverable?: string;
}

interface NextWeekTaskInput {
  taskName: string;
  description?: string;
}

interface BlockerInput {
  description: string;
  isKeyIssue?: boolean;
}

interface AchievementInput {
  description: string;
  isKeyAchievement?: boolean;
}

interface HoursInput {
  development?: number;
  testing?: number;
  meetings?: number;
  documentation?: number;
  other?: number;
}

interface CreateReportInput {
  userId: number;
  projectId: number;
  weekStart: Date;
  weekEnd: Date;
  tasksCompleted?: TaskCompletedInput[];
  nextWeekTasks?: NextWeekTaskInput[];
  blockers?: BlockerInput[];
  achievements?: AchievementInput[];
  hours?: HoursInput;
}

export const createReport = async ({
  userId,
  projectId,
  weekStart,
  weekEnd,
  tasksCompleted = [],
  nextWeekTasks = [],
  blockers = [],
  achievements = [],
  hours
}: CreateReportInput) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.isActive) {
    throw new Error("Cannot create a report against an inactive project");
  }

  const existingReport = await prisma.report.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart
      }
    }
  });

  if (existingReport) {
    throw new Error("A report for this week already exists");
  }

  const keyIssueCount = blockers.filter((b) => b.isKeyIssue).length;

  if (keyIssueCount > 1) {
    throw new Error("Only one blocker can be flagged as the key issue");
  }

  const keyAchievementCount = achievements.filter((a) => a.isKeyAchievement).length;

  if (keyAchievementCount > 1) {
    throw new Error("Only one achievement can be flagged as the key achievement");
  }

  const hasHours =
    !!hours &&
    (hours.development ?? 0) +
      (hours.testing ?? 0) +
      (hours.meetings ?? 0) +
      (hours.documentation ?? 0) +
      (hours.other ?? 0) > 0;

  const totalHours = hasHours
    ? (hours!.development ?? 0) +
      (hours!.testing ?? 0) +
      (hours!.meetings ?? 0) +
      (hours!.documentation ?? 0) +
      (hours!.other ?? 0)
    : 0;

  return prisma.$transaction(async (tx) => {
    const report = await tx.report.create({
      data: {
        userId,
        projectId,
        weekStart,
        weekEnd,
        status: ReportStatus.DRAFT
      }
    });

    const version = await tx.reportVersion.create({
      data: {
        reportId: report.id,
        versionNumber: 1
      }
    });

    if (tasksCompleted.length) {
      await tx.reportVersionTask.createMany({
        data: tasksCompleted.map((task, index) => ({
          reportVersionId: version.id,
          ...task,
          sortOrder: index
        }))
      });
    }

    if (nextWeekTasks.length) {
      await tx.reportVersionNextTask.create({
        data: {
          reportVersionId: version.id,
          tasks: JSON.parse(JSON.stringify(nextWeekTasks))
        }
      });
    }

    if (blockers.length) {
      await tx.reportVersionBlocker.createMany({
        data: blockers.map((blocker, index) => ({
          reportVersionId: version.id,
          ...blocker,
          sortOrder: index
        }))
      });
    }

    if (achievements.length) {
      await tx.reportVersionAchievement.createMany({
        data: achievements.map((achievement, index) => ({
          reportVersionId: version.id,
          ...achievement,
          sortOrder: index
        }))
      });
    }

    if (hasHours) {
      await tx.reportVersionHours.create({
        data: {
          reportVersionId: version.id,
          ...hours,
          totalHours
        }
      });
    }

    return tx.report.findUniqueOrThrow({
      where: { id: report.id },
      include: {
        versions: {
          include: {
            tasks: true,
            nextTasks: true,
            blockers: true,
            achievements: true,
            hours: true
          }
        }
      }
    });
  });
};

export const deleteDraftReport = async (reportId: number, userId: number) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      userId: true,
      status: true
    }
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.userId !== userId) {
    throw new Error("Report does not belong to this user");
  }

  if (report.status !== ReportStatus.DRAFT) {
    throw new Error("Only draft reports can be deleted");
  }

  await prisma.report.delete({
    where: { id: reportId }
  });
};

export const forceDeleteReport = async (reportId: number) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true }
  });

  if (!report) {
    throw new Error("Report not found");
  }

  await prisma.report.delete({
    where: { id: reportId }
  });
};