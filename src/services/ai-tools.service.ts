// src/services/ai-tools.ts
//
// Declares the tools Gemini is allowed to call, and dispatches a tool call
// by name to the matching db-tools.service function.

import { Type, type FunctionDeclaration } from "@google/genai";
import {
  countReports,
  listReports,
  listProjects,
  countProjects,
  listTeamMembers,
  countTeamMembers,
} from "./db-tools.service.js";

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "countReports",
    description:
      "Count reports matching optional filters. Use for questions like 'how many reports this week' or 'how many approved reports'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ["DRAFT", "SUBMITTED", "NEEDS_CORRECTION", "APPROVED"],
          description: "Filter by report status",
        },
        projectName: { type: Type.STRING, description: "Filter by project name" },
        userName: { type: Type.STRING, description: "Filter by team member name" },
        startDate: { type: Type.STRING, description: "ISO date (YYYY-MM-DD), weekStart >= this date" },
        endDate: { type: Type.STRING, description: "ISO date (YYYY-MM-DD), weekStart <= this date" },
      },
    },
  },
  {
    name: "listReports",
    description:
      "List reports matching optional filters, most recent first. Use when the admin wants to see which reports, not just a count.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["DRAFT", "SUBMITTED", "NEEDS_CORRECTION", "APPROVED"] },
        projectName: { type: Type.STRING },
        userName: { type: Type.STRING },
        startDate: { type: Type.STRING },
        endDate: { type: Type.STRING },
      },
    },
  },
  {
    name: "listProjects",
    description: "List projects, optionally filtered by active status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        isActive: { type: Type.BOOLEAN, description: "true = active only, false = inactive only" },
      },
    },
  },
  {
    name: "countProjects",
    description: "Count projects, optionally filtered by active status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        isActive: { type: Type.BOOLEAN },
      },
    },
  },
  {
    name: "listTeamMembers",
    description:
      "List team members, optionally filtered by role or by a project they have submitted reports for. Use this for 'who worked on project X'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING, enum: ["TEAM_MEMBER", "ADMIN"] },
        projectName: { type: Type.STRING, description: "Only members who have reports on this project" },
      },
    },
  },
  {
    name: "countTeamMembers",
    description: "Count team members, optionally filtered by role or project.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING, enum: ["TEAM_MEMBER", "ADMIN"] },
        projectName: { type: Type.STRING },
      },
    },
  },
];

type ToolArgs = Record<string, any>;

export async function executeTool(name: string, args: ToolArgs) {
  switch (name) {
    case "countReports":
      return countReports(args);
    case "listReports":
      return listReports(args);
    case "listProjects":
      return listProjects(args);
    case "countProjects":
      return countProjects(args);
    case "listTeamMembers":
      return listTeamMembers(args);
    case "countTeamMembers":
      return countTeamMembers(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}