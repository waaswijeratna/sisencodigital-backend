// src/services/ai.service.ts
//
// Stateless request/response — no chat history is kept across HTTP calls.
// Within a single call, we loop with Gemini until it stops requesting tools
// and returns a final text answer.

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { toolDeclarations, executeTool } from "./ai-tools.service.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey });

// gemini-2.5-flash-lite is deprecated for new API keys (Google's error points
// here). gemini-3.5-flash-lite is the current lite tier with a solid free quota.
const MODEL = "gemini-3.5-flash-lite";
const MAX_TOOL_ROUNDS = 5; // safety cap against infinite tool-call loops

const FALLBACK_ANSWER =
  "I couldn't generate an answer for that. Try rephrasing, or ask about reports, projects, or team members.";

const QUOTA_EXCEEDED_ANSWER =
  "The AI assistant has hit its usage limit for now. Please try again in a minute, or later today.";

export const askAI = async (message: string) => {
  try {
    return await runChat(message);
  } catch (error: any) {
    // Google's SDK throws ApiError with a `status` field for HTTP errors.
    if (error?.status === 429 || error?.status === "RESOURCE_EXHAUSTED") {
      console.error("AI quota exceeded:", error.message ?? error);
      return QUOTA_EXCEEDED_ANSWER;
    }
    throw error; // let the controller's catch block handle anything else
  }
};

const runChat = async (message: string) => {
  const today = new Date().toISOString().split("T")[0];

  const contents: any[] = [{ role: "user", parts: [{ text: message }] }];

  const config = {
    tools: [{ functionDeclarations: toolDeclarations }],
    // 3.x-series models use thinkingLevel, not thinkingBudget (that's 2.5-only
    // and will 400 here). "minimal" is the fastest setting for a lite model
    // doing simple tool routing.
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.MINIMAL,
    },
    maxOutputTokens: 512,
    systemInstruction:
      `You are an internal admin assistant for a reporting dashboard. ` +
      `Today's date is ${today}. ` +
      `Only call a tool when the question is actually about reports, projects, team members, or users. ` +
      `When a filter needs a date range (e.g. "this week"), compute it yourself as ISO date strings (YYYY-MM-DD) before calling a tool. ` +
      `Use tools to get real data before answering data questions — never guess numbers. ` +
      `If the question is a greeting, small talk, or unrelated to the database, reply directly in plain text WITHOUT calling any tool. ` +
      `Always finish by giving a plain-text answer to the user — never end your turn with only a function call. ` +
      `Answer concisely and directly.`,
  };

  let response = await ai.models.generateContent({ model: MODEL, contents, config });

  let rounds = 0;
  while (response.functionCalls && response.functionCalls.length > 0 && rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    // Echo the model's turn (including its function call) back into the conversation
    contents.push({ role: "model", parts: response.candidates?.[0]?.content?.parts ?? [] });

    const responseParts = [];
    for (const call of response.functionCalls) {
      let result: unknown;
      try {
        result = await executeTool(call.name!, call.args ?? {});
      } catch (error) {
        result = { error: error instanceof Error ? error.message : "Tool execution failed" };
      }

      responseParts.push({
        functionResponse: {
          name: call.name,
          response: { result },
        },
      });
    }

    contents.push({ role: "user", parts: responseParts });

    response = await ai.models.generateContent({ model: MODEL, contents, config });
  }

  // Guard 1: hit MAX_TOOL_ROUNDS and the model is still trying to call tools.
  // Force one final text-only pass with tools turned off so we always get
  // a real answer instead of an empty response.
  if (response.functionCalls && response.functionCalls.length > 0) {
    contents.push({ role: "model", parts: response.candidates?.[0]?.content?.parts ?? [] });
    contents.push({
      role: "user",
      parts: [{ text: "Stop calling tools. Summarize what you know so far and answer directly, in plain text." }],
    });

    const { tools, ...configWithoutTools } = config;

    response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: configWithoutTools,
    });
  }

  // Guard 2: absolute last resort — never let `answer` be undefined.
  return response.text ?? FALLBACK_ANSWER;
};