import type { Request, Response } from "express";
import { askAI } from "../services/ai.service.js";

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const answer = await askAI(message);

    return res.status(200).json({
      answer,
    });
  } catch (error) {
    console.error("AI Error:", error);

    return res.status(500).json({
      message: "Failed to get AI response",
    });
  }
};