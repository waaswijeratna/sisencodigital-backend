import prisma from "../lib/prisma.js";
import { Role } from "../../generated/prisma/enums.js";

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

export const getTeamMemberOverview = async (userId: number) => {
  const { weekStart, nextWeekStart } = getCurrentWeek();
  const [totalReports, currentReport, recentReports] = await Promise.all([
    prisma.report.count({ where: { userId } }),
    prisma.report.findFirst({
      where: { userId, weekStart: { gte: weekStart, lt: nextWeekStart } },
      orderBy: { weekStart: "desc" },
      select: {
        id: true,
        status: true,
        weekStart: true,
        weekEnd: true,
        project: { select: { id: true, name: true } },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: {
            tasks: { select: { id: true } },
            blockers: { select: { id: true } },
            achievements: { select: { id: true } },
            hours: { select: { totalHours: true } }
          }
        }
      }
    }),
    prisma.report.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        weekStart: true,
        weekEnd: true,
        project: { select: { id: true, name: true } }
      }
    })
  ]);

  const version = currentReport?.versions[0];

  return {
    totalReports,
    currentReport: currentReport
      ? {
          id: currentReport.id,
          status: currentReport.status,
          weekStart: currentReport.weekStart,
          weekEnd: currentReport.weekEnd,
          project: currentReport.project,
          tasksCompleted: version?.tasks.length ?? 0,
          blockers: version?.blockers.length ?? 0,
          achievements: version?.achievements.length ?? 0,
          totalHours: version?.hours?.totalHours ?? 0
        }
      : null,
    recentReports
  };
};

export const teamMemberRole = Role.TEAM_MEMBER;
