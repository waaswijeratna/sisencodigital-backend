import { type Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createProject as createProjectService,
  getAllProjects,
  getProjectById,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService
} from "../services/project.service.js";

export const createProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body ?? {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const project = await createProjectService({
      name: name.trim(),
      ...(typeof description === "string" ? { description: description.trim() } : {})
    });

    return res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A project with this name already exists"
    ) {
      return res.status(409).json({
        message: error.message
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getProjects = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const projects = await getAllProjects(includeInactive);

    return res.status(200).json({
      projects
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid project id"
      });
    }

    const project = await getProjectById(id);

    return res.status(200).json({
      project
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Project not found"
    ) {
      return res.status(404).json({
        message: error.message
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid project id"
      });
    }

    const { name, description, isActive } = req.body ?? {};

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({
        message: "Project name cannot be empty"
      });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean"
      });
    }

    const project = await updateProjectService(id, {
      ...(typeof name === "string" ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(isActive !== undefined ? { isActive } : {})
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Project not found") {
        return res.status(404).json({
          message: error.message
        });
      }

      if (error.message === "A project with this name already exists") {
        return res.status(409).json({
          message: error.message
        });
      }
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid project id"
      });
    }

    const { project, deactivatedOnly } = await deleteProjectService(id);

    return res.status(200).json({
      message: deactivatedOnly
        ? "Project has existing reports, so it was deactivated instead of deleted"
        : "Project deleted successfully",
      project
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Project not found"
    ) {
      return res.status(404).json({
        message: error.message
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};