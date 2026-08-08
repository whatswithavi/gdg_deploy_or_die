# Custom Agent & Skill

## Agent: `CodeReviewAgent`

**File**: [`server/agents/codeReviewAgent.ts`](server/agents/codeReviewAgent.ts)

**Purpose**: Orchestrates a single code-review request end-to-end.

**Responsibilities**:
1. Validate that code was actually provided and an API key is configured.
2. Invoke the `review_diff` skill to build the LLM prompt.
3. Call the Gemini API (`gemini-2.0-flash`) with the prompt.
4. Parse and validate the model's response against the skill's expected JSON schema.
5. Return typed `ReviewResult` on success, or throw a typed `CodeReviewAgentError` on any failure (missing input, missing key, HTTP failure, malformed model output) — callers (the route) never have to guess what went wrong.

**Why it's a separate "agent" from the HTTP route**: the route (`server/routes/review.ts`) only knows HTTP — status codes, request/response shape. The agent knows nothing about HTTP; it's a plain async function that could be called from a CLI, a test, or a future GitHub Action just as easily as from Express.

## Skill: `review_diff`

**File**: [`server/skills/review_diff.ts`](server/skills/review_diff.ts)

**Purpose**: The reusable review *capability* — separate from orchestration so it can be reused by other agents/entry points later without duplicating the review logic.

**Owns**:
- The prompt: instructs the model to act as a senior code reviewer, check for bugs / security issues (SQLi, XSS, hardcoded secrets, unsafe deserialization) / style problems, and cite line numbers + concrete fixes.
- The output contract: strict JSON schema (`{ issues: [{ severity, category, line, description, suggestion }] }`), enforced by `parseReviewResponse`, which throws if the model's output doesn't match — the agent surfaces this as a clear error instead of silently passing through garbage.

**Severity taxonomy**: `critical | high | medium | low`
**Category taxonomy**: `bug | security | style`

## How they compose

```
runCodeReview(code)                 // agent
  → buildReviewPrompt(code)         // skill: builds the prompt
  → fetch(Gemini API)                // agent: calls the LLM
  → parseReviewResponse(raw)        // skill: validates + parses the response
  → ReviewResult                    // agent: returns typed result
```

## Extending later (not built, documented for context)

A second skill, `generate_tests`, could be added following the same pattern (own file in `server/skills/`, own prompt + schema) and invoked by the same `CodeReviewAgent` or a new `TestGenAgent` — the agent/skill split exists specifically to make this kind of extension additive rather than a rewrite.
