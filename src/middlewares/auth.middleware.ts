import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Role } from "../../generated/prisma/enums.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: Role;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: Role;
    };

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};