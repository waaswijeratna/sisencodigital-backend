import prisma from "../lib/prisma.js";

interface CreateProjectInput {
  name: string;
  description?: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface ServiceError extends Error {
  status?: number;
}

const createError = (message: string, status: number): ServiceError => {
  const err: ServiceError = new Error(message);
  err.status = status;
  return err;
};

export const createProject = async ({
  name,
  description
}: CreateProjectInput) => {
  const existingProject = await prisma.project.findUnique({
    where: {
      name
    }
  });

  if (existingProject) {
    throw createError("A project with this name already exists", 409);
  }

  return prisma.project.create({
    data: {
      name,
      description: description ?? null
    }
  });
};

export const getAllProjects = async (includeInactive: boolean = false) => {
  return prisma.project.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: {
      name: "asc"
    }
  });
};

export const getProjectById = async (id: number) => {
  const project = await prisma.project.findUnique({
    where: {
      id
    }
  });

  if (!project) {
    throw createError("Project not found", 404);
  }

  return project;
};

export const updateProject = async (
  id: number,
  data: UpdateProjectInput
) => {
  await getProjectById(id);

  if (data.name) {
    const existingProject = await prisma.project.findUnique({
      where: {
        name: data.name
      }
    });

    if (existingProject && existingProject.id !== id) {
      throw createError("A project with this name already exists", 409);
    }
  }

  return prisma.project.update({
    where: {
      id
    },
    data
  });
};

export const deleteProject = async (id: number) => {
  await getProjectById(id);

  const reportCount = await prisma.report.count({
    where: {
      projectId: id
    }
  });

  // Soft-delete if historical reports are attached; otherwise hard-delete
  if (reportCount > 0) {
    const project = await prisma.project.update({
      where: {
        id
      },
      data: {
        isActive: false
      }
    });

    return {
      project,
      deactivatedOnly: true
    };
  }

  const project = await prisma.project.delete({
    where: {
      id
    }
  });

  return {
    project,
    deactivatedOnly: false
  };
};