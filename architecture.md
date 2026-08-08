# Architecture — AI Code Review Assistant

## What it is

A web app that takes a pasted code diff/snippet and returns a structured AI-generated review: flagged issues (bug / security / style), severity, and a suggested fix. Track B — Developer Productivity.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 24 + TypeScript | Type safety for the structured review schema shared between agent and API. |
| Server | Express | Minimal, one route, no need for a heavier framework. |
| Frontend | Static HTML/JS (no framework) | Single textarea + results list; a framework would add build overhead for no UX benefit. |
| LLM provider | Google Gemini (AI Studio, free tier) | No-cost, no-card free tier; sufficient quality for structured text review. |
| E2E testing | Playwright | Exercises the real user flow end-to-end; explicitly recommended by the hackathon brief. |
| CI/CD | GitHub Actions | Install → build → lint → Playwright, must stay green. |

## Data flow

```
Browser (public/index.html)
   │  paste code, click "Review"
   ▼
POST /api/review  { code: string }
   │
   ▼
server/routes/review.ts
   │  validates request body
   ▼
server/agents/codeReviewAgent.ts   (custom agent)
   │  invokes skill, calls LLM, validates/parses response
   ▼
server/skills/review_diff.ts       (custom skill: prompt + output schema)
   │
   ▼
Gemini API (generateContent)
   │  returns JSON: { issues: [{ severity, category, line, description, suggestion }] }
   ▼
back up through agent → route → JSON response
   ▼
Browser renders issue list, color-coded by severity
```

## Component responsibilities

- **`server/routes/review.ts`** — HTTP boundary only: validate input, call the agent, map errors to status codes. No business logic.
- **`server/agents/codeReviewAgent.ts`** — orchestration: takes raw code, invokes the `review_diff` skill to build the prompt, calls the LLM client, validates the response against the expected schema, returns typed results or a typed error.
- **`server/skills/review_diff.ts`** — the reusable capability: owns the prompt (rules for what counts as a bug/security/style issue, severity taxonomy) and the expected output JSON schema. Kept separate from the agent so it can be reused by other agents/entry points later (e.g. a future CLI or GitHub Action) without duplicating the review logic.
- **`public/index.html` / `public/app.js`** — single-page UI: textarea for code input, submit button, results rendered as a list.

## Why an agent/skill split (not one file)

The hackathon requires a documented custom agent *and* a documented custom skill as separate, committed artifacts. Splitting orchestration (agent) from capability/prompt-contract (skill) also mirrors how this would extend in practice — e.g. adding a second skill (`generate_tests`) that the same agent can invoke without rewriting orchestration.

## Testing strategy

Playwright drives the real browser flow: load the page, paste a snippet with a known issue (e.g. a hardcoded secret or SQL string concatenation), click Review, assert the issue list renders with the expected severity. This is stronger evidence of a working product than a unit test on the prompt string alone.

## Environment / secrets

`GEMINI_API_KEY` read from environment (`.env`, gitignored). `.env.example` documents the required variable without exposing a real value. No API key is ever committed.

## Known limitations (accepted for a 12h solo scope)

- No GitHub PR/OAuth integration — input is paste-based. Documented as a stretch goal, not attempted, to protect the working-demo requirement.
- Single LLM provider (Gemini), no automatic fallback — acceptable risk for a low-volume solo demo.
