import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";
import { Role } from "../../generated/prisma/enums.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export const registerUser = async ({
  name,
  email,
  password
}: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.TEAM_MEMBER
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return user;
};

export const loginUser = async ({
  email,
  password
}: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const getCurrentUser = async (userId: number) => {
  return prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
};

export const getTeamMembers = async () => {
  const users = await prisma.user.findMany({
    where: { role: Role.TEAM_MEMBER },
    select: {
      id: true,
      name: true,
      email: true,
      reports: {
        orderBy: { weekStart: "desc" },
        take: 1,
        select: {
          id: true,
          weekStart: true,
          weekEnd: true,
          status: true,
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            select: {
              blockers: { select: { description: true, isKeyIssue: true } },
              achievements: { select: { description: true, isKeyAchievement: true } }
            }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return users.map(({ reports, ...user }) => ({
    ...user,
    latestReport: reports[0]
      ? {
          id: reports[0].id,
          weekStart: reports[0].weekStart,
          weekEnd: reports[0].weekEnd,
          status: reports[0].status,
          blockers: reports[0].versions[0]?.blockers ?? [],
          achievements: reports[0].versions[0]?.achievements ?? []
        }
      : null
  }));
};