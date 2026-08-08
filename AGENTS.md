# Agent Rules

Rules for any AI coding agent (Cline, Claude, etc.) working in this repository.

## Stack

- TypeScript + Node.js + Express on the backend. No frontend framework — plain HTML/JS in `public/`.
- Do not introduce a frontend framework (React/Next/etc.) or a second backend framework without discussing it first — scope is deliberately minimal for a 12-hour solo build.

## Conventions

- Keep `server/routes/*` as thin HTTP boundaries only (validation + status codes). Business logic belongs in `server/agents/*` and `server/skills/*`.
- Every custom agent lives in `server/agents/`, every custom skill in `server/skills/`. Document both in `AGENTS_AND_SKILLS.md` when added.
- Never commit `.env` or any real API key. Only `.env.example` (with empty values) is committed.
- Do not modify `architecture.md`'s documented data flow without updating the diagram in the same commit.

## Testing

- Any new user-facing behavior needs a corresponding Playwright test in `tests/`.
- Do not mark work done if `npm run test:e2e` or `npm run lint` fails locally.

## Git

- Commit frequently in small, logical units — not one giant end-of-day commit. This is a scored criterion (clean Git history).
- Conventional, descriptive commit messages (what changed + why), no filler.

## Out of scope for this build

- GitHub OAuth / live PR integration.
- Multi-provider LLM fallback logic.
- Authentication/user accounts.

If asked to add any of the above, flag that it's outside the documented 12-hour scope before implementing.
