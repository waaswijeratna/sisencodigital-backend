import prisma from "../lib/prisma.js";
import type { ReportFilters } from "../lib/report-filters.js";

const latestVersionInclude = {
  tasks: { orderBy: { sortOrder: "asc" as const } },
  nextTasks: { orderBy: { sortOrder: "asc" as const } },
  blockers: { orderBy: { sortOrder: "asc" as const } },
  achievements: { orderBy: { sortOrder: "asc" as const } },
  hours: true,
  reviews: {
    orderBy: { createdAt: "desc" as const },
    include: {
      reviewer: {
        select: { id: true, name: true, email: true }
      }
    }
  }
} as const;

const summaryVersionInclude = {
  _count: {
    select: {
      tasks: true
    }
  },
  blockers: {
    orderBy: { sortOrder: "asc" as const },
    select: { description: true, isKeyIssue: true }
  },
  achievements: {
    orderBy: { sortOrder: "asc" as const },
    select: { description: true, isKeyAchievement: true }
  },
  hours: true
} as const;

const getDateRange = (date: Date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { gte: start, lt: end };
};

const buildWhere = (userId: number, filters: ReportFilters) => ({
  userId,
  ...(filters.status ? { status: filters.status } : {}),
  ...(
    filters.date
      ? (() => {
          const selectedDate = getDateRange(filters.date);

          return {
            weekStart: { lt: selectedDate.lt },
            weekEnd: { gte: selectedDate.gte }
          };
        })()
      : filters.fromDate || filters.toDate
        ? {
            weekStart: {
              ...(filters.fromDate ? { gte: getDateRange(filters.fromDate).gte } : {}),
              ...(filters.toDate ? { lt: getDateRange(filters.toDate).lt } : {})
            }
          }
        : {}
  )
});

const toSummary = (report: any) => ({
  id: report.id,
  weekStart: report.weekStart,
  weekEnd: report.weekEnd,
  status: report.status,
  project: report.project,
  tasksCompletedCount: report.versions[0]?._count.tasks ?? 0,
  totalWorkedHours: report.versions[0]?.hours?.totalHours ?? 0,
  blockers: report.versions[0]?.blockers ?? [],
  achievements: report.versions[0]?.achievements ?? []
});

export const getTeamMemberReports = async (
  userId: number,
  filters: ReportFilters
) => {
  const reports = await prisma.report.findMany({
    where: buildWhere(userId, filters),
    orderBy: { weekStart: "desc" },
    include: {
      project: {
        select: { id: true, name: true }
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: summaryVersionInclude
      }
    }
  });

  return reports.map(toSummary);
};

export const getTeamMemberReportById = async (
  reportId: number,
  userId: number
) => {
  const report = await prisma.report.findFirst({
    where: { id: reportId, userId },
    include: {
      project: {
        select: { id: true, name: true, description: true }
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        include: latestVersionInclude
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  if (!report) {
    throw new Error("Report not found");
  }

  const [latestVersion, ...previousVersions] = report.versions;

  return {
    id: report.id,
    weekStart: report.weekStart,
    weekEnd: report.weekEnd,
    status: report.status,
    project: report.project,
    latestVersion,
    previousVersions: previousVersions.map((version) => ({
      id: version.id,
      versionNumber: version.versionNumber,
      submittedAt: version.submittedAt,
      createdAt: version.createdAt,
      tasksCompletedCount: version.tasks.length,
      totalWorkedHours: version.hours?.totalHours ?? 0,
      blockersCount: version.blockers.length,
      achievementsCount: version.achievements.length
    })),
    adminMessages: report.reviews.map((review) => ({
      id: review.id,
      versionId: review.reportVersionId,
      action: review.action,
      message: review.comment,
      createdAt: review.createdAt,
      reviewer: review.reviewer
    }))
  };
};
