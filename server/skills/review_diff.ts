/**
 * Custom skill: review_diff
 *
 * Reusable capability: given a code snippet, produce a structured review.
 * Owns the prompt contract and the expected output schema so any agent
 * (this one, or a future CLI/GitHub Action) can invoke it the same way.
 */

export interface ReviewIssue {
  severity: "critical" | "high" | "medium" | "low";
  category: "bug" | "security" | "style";
  line: number | null;
  description: string;
  suggestion: string;
}

export interface ReviewResult {
  issues: ReviewIssue[];
}

const OUTPUT_SCHEMA_HINT = `Respond with ONLY valid JSON matching this exact shape, no markdown fences, no commentary:
{
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "category": "bug" | "security" | "style",
      "line": number | null,
      "description": string,
      "suggestion": string
    }
  ]
}
If there are no issues, return {"issues": []}.`;

export function buildReviewPrompt(code: string): string {
  return [
    "You are a meticulous senior code reviewer.",
    "Review the following code snippet for bugs, security vulnerabilities (e.g. SQL injection, XSS, hardcoded secrets, unsafe deserialization), and style problems.",
    "Be specific: cite the line number when possible and give a concrete suggested fix, not a vague comment.",
    "",
    OUTPUT_SCHEMA_HINT,
    "",
    "Code to review:",
    "```",
    code,
    "```",
  ].join("\n");
}

export function parseReviewResponse(raw: string): ReviewResult {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed || !Array.isArray(parsed.issues)) {
    throw new Error("Model response did not match the expected { issues: [] } shape");
  }

  return parsed as ReviewResult;
}
