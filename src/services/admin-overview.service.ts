import prisma from "../lib/prisma.js";
import { ReportStatus, ReviewAction, Role } from "../../generated/prisma/enums.js";

const getCurrentWeek = () => {
  const today = new Date();
  const day = today.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  weekStart.setUTCDate(weekStart.getUTCDate() + mondayOffset);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
  return { weekStart, nextWeekStart };
};

const latestVersionInclude = {
  tasks: true,
  blockers: true,
  hours: true
} as const;

const isSubmitted = (status: ReportStatus) => status === ReportStatus.SUBMITTED;

export const getAdminOverview = async () => {
  const { weekStart, nextWeekStart } = getCurrentWeek();

  const [currentWeekReports, reports, recentReports, recentReviews] = await Promise.all([
    prisma.report.findMany({
      where: { weekStart: { gte: weekStart, lt: nextWeekStart }, user: { role: Role.TEAM_MEMBER } },
      select: { id: true, status: true }
    }),
    prisma.report.findMany({
      where: { user: { role: Role.TEAM_MEMBER } },
      orderBy: { weekStart: "asc" },
      select: {
        id: true,
        weekStart: true,
        weekEnd: true,
        status: true,
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        versions: { orderBy: { versionNumber: "desc" }, take: 1, include: latestVersionInclude }
      }
    }),
    prisma.report.findMany({
      where: { user: { role: Role.TEAM_MEMBER } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    }),
    prisma.reportReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        comment: true,
        createdAt: true,
        reportId: true,
        report: {
          select: {
            project: { select: { id: true, name: true } },
            user: { select: { id: true, name: true } }
          }
        },
        reviewer: { select: { id: true, name: true } }
      }
    })
  ]);

  const submittedCount = currentWeekReports.filter((report) => isSubmitted(report.status)).length;
  const pendingCount = currentWeekReports.filter((report) => !isSubmitted(report.status)).length;
  const lateCount = reports.filter((report) => report.weekEnd < weekStart && isSubmitted(report.status)).length;
  const complianceTotal = submittedCount + pendingCount + lateCount;

  const taskTrend = new Map<string, { weekStart: string; userId: number; userName: string; tasksCompleted: number }>();
  const statusByMember = new Map<number, { userId: number; userName: string; draft: number; submitted: number; needsCorrection: number; approved: number }>();
  const workloadByProject = new Map<number, { projectId: number; projectName: string; taskCount: number }>();
  const timeByTaskType = { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 };
  let openBlockersCount = 0;

  for (const report of reports) {
    const version = report.versions[0];
    const taskCount = version?.tasks.length ?? 0;
    const weekKey = report.weekStart.toISOString().slice(0, 10);
    const trendKey = `${weekKey}:${report.user.id}`;
    const trend = taskTrend.get(trendKey) ?? { weekStart: weekKey, userId: report.user.id, userName: report.user.name, tasksCompleted: 0 };
    trend.tasksCompleted += taskCount;
    taskTrend.set(trendKey, trend);

    const member = statusByMember.get(report.user.id) ?? { userId: report.user.id, userName: report.user.name, draft: 0, submitted: 0, needsCorrection: 0, approved: 0 };
    if (report.status === ReportStatus.DRAFT) member.draft += 1;
    if (report.status === ReportStatus.SUBMITTED) member.submitted += 1;
    if (report.status === ReportStatus.NEEDS_CORRECTION) member.needsCorrection += 1;
    if (report.status === ReportStatus.APPROVED) member.approved += 1;
    statusByMember.set(report.user.id, member);

    const project = workloadByProject.get(report.project.id) ?? { projectId: report.project.id, projectName: report.project.name, taskCount: 0 };
    project.taskCount += taskCount;
    workloadByProject.set(report.project.id, project);

    openBlockersCount += version?.blockers.length ?? 0;
    if (version?.hours) {
      timeByTaskType.development += version.hours.development;
      timeByTaskType.testing += version.hours.testing;
      timeByTaskType.meetings += version.hours.meetings;
      timeByTaskType.documentation += version.hours.documentation;
      timeByTaskType.other += version.hours.other;
    }
  }

  const reportActivities = recentReports.map((report) => ({
    type: "REPORT_CREATED" as const,
    reportId: report.id,
    user: report.user,
    project: report.project,
    status: report.status,
    createdAt: report.createdAt
  }));
  const reviewActivities = recentReviews.map((review) => ({
    type: review.action === ReviewAction.APPROVED ? "REPORT_APPROVED" as const : "CHANGES_REQUESTED" as const,
    reviewId: review.id,
    reportId: review.reportId,
    user: review.report.user,
    project: review.report.project,
    action: review.action,
    comment: review.comment,
    reviewer: review.reviewer,
    createdAt: review.createdAt
  }));

  return {
    period: { weekStart, weekEnd: new Date(nextWeekStart.getTime() - 1) },
    summaryMetrics: {
      totalReportsSubmittedThisWeek: {
        value: currentWeekReports.length,
        description: "Current-week report count"
      },
      submissionComplianceRate: {
        submittedCount,
        pendingCount,
        lateCount,
        compliancePercentage: complianceTotal === 0 ? 0 : Number(((submittedCount / complianceTotal) * 100).toFixed(1)),
        description: "Current-week submitted reports against pending and late reports"
      },
      needsCorrectionReportsCount: {
        value: reports.filter((report) => report.status === ReportStatus.NEEDS_CORRECTION).length,
        description: "Reports needing correction"
      },
      openBlockersCount: {
        value: openBlockersCount,
        description: "Open blockers across the team"
      }
    },
    charts: {
      tasksCompletedTrend: [...taskTrend.values()],
      reportStatusByTeamMember: [...statusByMember.values()],
      workloadByProject: [...workloadByProject.values()],
      timeSpentByTaskType: Object.entries(timeByTaskType).map(([taskType, hours]) => ({ taskType, hours }))
    },
    recentActivity: [...reviewActivities, ...reportActivities]
      .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
      .slice(0, 10)
  };
};
