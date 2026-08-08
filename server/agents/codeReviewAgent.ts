/**
 * Custom agent: CodeReviewAgent
 *
 * Orchestrates a review request end-to-end: takes raw code, invokes the
 * review_diff skill to build the prompt, calls the LLM, validates the
 * response, and returns typed results (or a typed error) to the caller.
 */

import { buildReviewPrompt, parseReviewResponse, ReviewResult } from "../skills/review_diff";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class CodeReviewAgentError extends Error {}

export async function runCodeReview(code: string): Promise<ReviewResult> {
  if (!code || !code.trim()) {
    throw new CodeReviewAgentError("No code provided");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new CodeReviewAgentError("GEMINI_API_KEY is not set");
  }

  const prompt = buildReviewPrompt(code);

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new CodeReviewAgentError(`LLM request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new CodeReviewAgentError("LLM returned no content");
  }

  try {
    return parseReviewResponse(text);
  } catch (err) {
    throw new CodeReviewAgentError(
      `Failed to parse LLM response as structured review: ${(err as Error).message}`
    );
  }
}
