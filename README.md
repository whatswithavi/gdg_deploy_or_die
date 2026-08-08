# AI Code Review Assistant

Paste a code snippet or diff into a small web app and get back a structured AI review: bugs, security issues, and style problems, each with a severity and a concrete suggested fix.

Built for **Deploy or Die: HowToAlgo × GDG on Campus KIIT Hackathon** — Track B (Developer Productivity).

## Docs

- [`architecture.md`](architecture.md) — stack, data flow, component design.
- [`AGENTS.md`](AGENTS.md) — rules for AI coding agents working in this repo.
- [`AGENTS_AND_SKILLS.md`](AGENTS_AND_SKILLS.md) — the custom agent (`CodeReviewAgent`) and custom skill (`review_diff`).
- [`DECISIONS.md`](DECISIONS.md) — running log of every build decision and why.

## Running locally

```bash
npm install
cp .env.example .env   # then fill in GEMINI_API_KEY
npm run build
npm start
```

Open `http://localhost:3000`, paste code, click **Review Code**.

## Testing

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

## Getting a Gemini API key (free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in, click "Create API key"
3. Put it in `.env` as `GEMINI_API_KEY=...` (never commit this file)
