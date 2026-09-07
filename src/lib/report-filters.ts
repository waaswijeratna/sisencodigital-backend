import { ReportStatus } from "../../generated/prisma/enums.js";

export interface ReportFilters {
  status?: ReportStatus;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
  teamMemberId?: number;
  projectId?: number;
}

const parseDate = (value: unknown) => {
  if (typeof value !== "string" || !value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parsePositiveInteger = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
};

export const parseReportFilters = (query: Record<string, unknown>) => {
  const statusValue = typeof query.status === "string"
    ? query.status.toUpperCase().replace(/\s+/g, "_")
    : undefined;

  if (
    statusValue !== undefined &&
    !Object.values(ReportStatus).includes(statusValue as ReportStatus)
  ) {
    throw new Error("Invalid report status");
  }

  const date = parseDate(query.date);
  const fromDate = parseDate(query.fromDate);
  const toDate = parseDate(query.toDate);
  const teamMemberId = parsePositiveInteger(query.teamMemberId);
  const projectId = parsePositiveInteger(query.projectId);

  if (
    date === null ||
    fromDate === null ||
    toDate === null ||
    teamMemberId === null ||
    projectId === null
  ) {
    throw new Error("Invalid report filter");
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new Error("fromDate cannot be after toDate");
  }

  const filters: ReportFilters = {};

  if (statusValue !== undefined) {
    filters.status = statusValue as ReportStatus;
  }
  if (date) {
    filters.date = date;
  }
  if (fromDate) {
    filters.fromDate = fromDate;
  }
  if (toDate) {
    filters.toDate = toDate;
  }
  if (teamMemberId) {
    filters.teamMemberId = teamMemberId;
  }
  if (projectId) {
    filters.projectId = projectId;
  }

  return filters;
};
