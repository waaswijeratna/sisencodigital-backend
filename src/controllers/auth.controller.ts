import { type Request, type Response } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getTeamMembers as getTeamMembersService
} from "../services/auth.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const user = await registerUser({
      name,
      email,
      password
    });

    return res.status(201).json({
      message: "Registration successful",
      user
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Email is already registered"
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

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await loginUser({
      email,
      password
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: result.user
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const logout = (
  req: Request,
  res: Response
) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return res.status(200).json({
    message: "Logout successful"
  });
};

export const me = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const user = await getCurrentUser(req.user.userId);

  if (!user) {
    return res.status(401).json({
      message: "User no longer exists"
    });
  }

  return res.status(200).json({
    user
  });
};

export const getTeamMembers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await getTeamMembersService();
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};