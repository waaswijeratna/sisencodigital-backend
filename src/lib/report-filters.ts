import { ReportStatus } from "../../generated/prisma/enums.js";

export interface ReportFilters {
  status?: ReportStatus;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
}

const parseDate = (value: unknown) => {
  if (typeof value !== "string" || !value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

  if (date === null || fromDate === null || toDate === null) {
    throw new Error("Invalid report date filter");
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

  return filters;
};
