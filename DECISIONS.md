# Decisions Log — Deploy or Die Hackathon

Running record of every meaningful decision made during the build, in order. This doubles as the "why" trail for the architecture doc and the Day 2 presentation.

## 2026-08-08 — Kickoff

- **Team**: Solo, 12-hour build window.
- **Track chosen: B — Developer Productivity.**
  - Why not Track A (Business Process Automation): BMAD workflow is the recommended fit for A but has a steeper learning curve; not worth the setup cost solo in 12h.
  - Why not Track C (Knowledge & Compliance): requires a retrieval/citation pipeline (RAG) to do well — the retrieval correctness piece is the highest-risk, most time-consuming part to get right solo.
  - Why B: smallest surface area to a working, demoable product. No OAuth, no document ingestion/retrieval pipeline — a single well-prompted LLM call over pasted code is enough to produce real, useful output.
- **Product idea: "AI Code Review Assistant."** Paste a code diff/snippet into a small web app → get a structured AI review (bugs, security issues, style problems, severity, suggested fix). Stretch goal: "generate tests" for flagged functions.
  - Why not "connect to a live GitHub PR": GitHub OAuth + API integration adds auth flow complexity and external dependency risk we can't afford on the clock. Paste-based input still satisfies "fits into a developer's workflow" and is trivially demoable/testable.
- **Stack: Node.js + TypeScript + Express (backend), plain HTML/JS (frontend, no framework), Playwright (e2e tests), GitHub Actions (CI).**
  - Why no frontend framework: paste-box + results list is simple enough that React/Next would only add build-tooling overhead for zero UX benefit at this scope.
  - Why Playwright over unit-tests-only: it's explicitly called out in the hackathon brief as the testing tool judges expect, and it exercises the real user flow (paste → review → see results), which is stronger evidence of a working product than isolated unit tests.
- **AI provider: Google AI Studio (Gemini), free tier.**
  - Why not Anthropic API directly: no meaningful free tier (small trial credits only) — too much cost/rate-limit risk for a 12h budget with no team to spread usage across.
  - Why not NVIDIA Build/Groq/OpenRouter as primary: Gemini's free tier is sufficient for a single-agent, low-volume demo; multi-provider fallback strategy is a nice-to-have we can add later if time and rate limits demand it, not a Day-1 requirement for a solo build.
- **Custom agent**: `CodeReviewAgent` — orchestrates the review request end-to-end (accepts code, invokes the skill, calls the LLM, parses/validates structured output).
- **Custom skill**: `review_diff` — the reusable review capability/prompt contract (bug/security/style rules, severity taxonomy, output schema). Kept separate from the agent so it's independently documented and reusable, per the hackathon's "custom agent + custom skill" requirement.

## Time budget (12h, solo)

| Hours | Block |
|---|---|
| 0.0–0.5 | Repo scaffold, decisions log, get API key |
| 0.5–1.5 | architecture.md, AGENTS.md, PRD stub |
| 1.5–4.0 | Agent + skill + LLM integration (backend) |
| 4.0–6.0 | Frontend UI |
| 6.0–7.5 | CI/CD (GitHub Actions) + Playwright test |
| 7.5–9.0 | Testing & bug fixing |
| 9.0–10.5 | Polish, README, AGENTS_AND_SKILLS.md |
| 10.5–12.0 | Buffer, demo capture, tag v1.0.0 |

## 2026-08-08 — API key & model troubleshooting

- First Gemini key generated had `limit: 0` on all free-tier quota metrics for `gemini-2.0-flash` — authenticated fine (not a bad key), but the backing Google Cloud project had no free-tier allocation for that model. Confirmed via direct API call before writing any app-side workarounds, to rule out an app bug first.
- A second, freshly-generated key still hit `limit: 0` specifically on `gemini-2.0-flash`, but `gemini-flash-latest` on the same key returned 200. Free-tier availability is inconsistent per-model per-account on Gemini right now — **fix was switching the model, not the key.**
  - Why this matters for judges/Day 2: if the model choice breaks again, the fix is a one-line change in `server/agents/codeReviewAgent.ts` (`GEMINI_MODEL` constant) — isolating the model name as a constant instead of inlining it into the fetch call was a deliberate small design choice for exactly this kind of churn.
- Found and fixed a real bug during this: `server/index.ts` never actually loaded `.env` — there was no `dotenv.config()` call, so `GEMINI_API_KEY` was always `undefined` locally regardless of what was in `.env`. Added the `dotenv` package and a `dotenv.config()` call at the top of the entrypoint.
- Increased the Playwright LLM test timeout from 20s to 40s (with `test.setTimeout(60000)`) — `gemini-flash-latest` returns `thoughtSignature` in its response, indicating it does some internal reasoning before answering, which takes longer than a non-reasoning model. Real network+LLM latency, not a flaky test.
- `GEMINI_API_KEY` set as a GitHub Actions repository secret (`gh secret set`) so CI's Playwright test — which makes a real LLM call — can pass, not just locally.

## Open risks

- Gemini free-tier rate limits under demo conditions — mitigation: keep prompt/response small, no retries-in-a-loop.
- Solo means no parallelization — every block above is sequential; scope is deliberately cut to the minimum that satisfies all 5 non-negotiables.
