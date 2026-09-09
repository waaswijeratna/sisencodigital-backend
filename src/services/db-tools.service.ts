// src/services/db-tools.service.ts
//
// Plain, read-only Prisma query functions. These are the actual "tools" the
// AI is allowed to call. Keep this file DB logic only — no Gemini imports here.

import prisma from "../lib/prisma.js";
import type { ReportStatus, Role } from "../../generated/prisma/enums.js";

// ---------- Reports ----------

interface ReportFilters {
  status?: ReportStatus;
  projectName?: string;
  userName?: string;
  startDate?: string; // ISO date, filters weekStart >=
  endDate?: string; // ISO date, filters weekStart <=
}

function buildReportWhere(filters: ReportFilters) {
  const where: Record<string, any> = {};

  if (filters.status) where.status = filters.status;

  if (filters.projectName) {
    where.project = { name: { equals: filters.projectName, mode: "insensitive" } };
  }

  if (filters.userName) {
    where.user = { name: { equals: filters.userName, mode: "insensitive" } };
  }

  if (filters.startDate || filters.endDate) {
    where.weekStart = {};
    if (filters.startDate) where.weekStart.gte = new Date(filters.startDate);
    if (filters.endDate) where.weekStart.lte = new Date(filters.endDate);
  }

  return where;
}

export async function countReports(filters: ReportFilters) {
  return prisma.report.count({ where: buildReportWhere(filters) });
}

export async function listReports(filters: ReportFilters, limit = 20) {
  return prisma.report.findMany({
    where: buildReportWhere(filters),
    take: limit,
    orderBy: { weekStart: "desc" },
    select: {
      id: true,
      status: true,
      weekStart: true,
      weekEnd: true,
      user: { select: { name: true } },
      project: { select: { name: true } },
    },
  });
}

// ---------- Projects ----------

interface ProjectFilters {
  isActive?: boolean;
}

export async function listProjects(filters: ProjectFilters) {
  return prisma.project.findMany({
    where: filters.isActive !== undefined ? { isActive: filters.isActive } : {},
    select: { id: true, name: true, description: true, isActive: true },
  });
}

export async function countProjects(filters: ProjectFilters) {
  return prisma.project.count({
    where: filters.isActive !== undefined ? { isActive: filters.isActive } : {},
  });
}

// ---------- Team members ----------

interface TeamMemberFilters {
  role?: Role;
  projectName?: string; // only members who have reports on this project
}

export async function listTeamMembers(filters: TeamMemberFilters) {
  if (filters.projectName) {
    const reports = await prisma.report.findMany({
      where: {
        project: { name: { equals: filters.projectName, mode: "insensitive" } },
      },
      distinct: ["userId"],
      select: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    let members = reports.map((r) => r.user);
    if (filters.role) members = members.filter((m) => m.role === filters.role);
    return members;
  }

  return prisma.user.findMany({
    where: filters.role ? { role: filters.role } : {},
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function countTeamMembers(filters: TeamMemberFilters) {
  const members = await listTeamMembers(filters);
  return members.length;
}