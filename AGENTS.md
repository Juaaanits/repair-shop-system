# AGENTS.md — Anton Fix Appliances Repair (Job Order MVP)

Project instructions for the coding agent. Read this before every task.

## What we are building

A small web app (installable PWA) for an appliance repair shop:
customers fill an intake form → the owner logs in, manages jobs and statuses → the owner prints a Job Order Slip (receipt) for the customer.

Visual reference for the intake form: `docs/reference/anton-fix-intake.html` (static prototype). Match its structure, wording, and look. Do not copy its fake logic (counter, tracking code); the real logic lives on the server.

## Stack (do not substitute without asking)

- Next.js (latest stable, App Router) + TypeScript `strict`
- PostgreSQL + Drizzle ORM + drizzle-kit migrations
- Zod for validation (shared client/server)
- Tailwind CSS (no component library in the MVP)
- Auth.js (credentials) for the single owner login; passwords hashed with `bcryptjs` (pure JS, avoids native-build problems on Windows). Verify the exact setup against current Auth.js docs before coding.
- Vitest for tests. npm (not pnpm or yarn; commit `package-lock.json`). ESLint + Prettier.
- Local DB: Docker Compose Postgres (fallback: a free hosted Postgres connection string in `.env`).

## Architecture rules

- Layers: `src/app` (routes/UI) → `src/server/services` (business logic) → `src/server/db` (schema/queries). No business logic or SQL in React components.
- Every mutation validates input with Zod **on the server**. Never trust the client.
- Every `/admin` page and every admin server action checks the session **on the server**, not only in middleware.
- Money is stored as integer centavos, never floats. Currency PHP (₱). Format in one helper.
- Store timestamps in UTC; display in `Asia/Manila`.
- Job status transitions are defined in ONE file and enforced server-side.
- Job numbers (`AF-YYYYMMDD-NNN`, Manila date) are generated with an atomic counter inside a transaction (`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`). Never "select max then insert".

## Security rules

- No secrets in code. Use `.env` (git-ignored) and keep `.env.example` current.
- No PII (names, phones, addresses) in logs.
- Public endpoint (intake): honeypot field + basic per-IP rate limit. Document limits of an in-memory limiter in `README.md`.
- Never store customer device passwords.

## Working agreement

- Work on ONE milestone at a time from `docs/mvp-plan.md`. Do not start the next one.
- Before coding a milestone: restate the plan in a few lines, list assumptions, then implement.
- Keep changes small and reviewable. Prefer boring, readable code over clever code.
- Do not invent APIs, flags, or library features. If unsure, check the docs or say you are unsure.
- Never claim something works unless you ran it. Report the exact commands you ran and their real results.
- After each milestone: run `npm run lint`, `npm run typecheck`, `npm test`, then summarize: what changed, why, trade-offs, how I can test it by hand.
- Explain non-obvious decisions in a short comment or in the architecture notes in `README.md`.
- Do not add features outside the MVP scope in `docs/mvp-plan.md`.

## Commands (keep this list accurate as the project evolves)

- `npm run dev` — run the app
- `npm run db:up` — start local Postgres (Docker Compose)
- `npm run db:migrate` — apply migrations
- `npm run db:seed` — create the owner account and default settings
- `npm run lint` · `npm run typecheck` · `npm test`

## Design

Use the `frontend-design` skill for the public intake form, the confirmation screen, and the print slip. Follow docs/reference/anton-fix-intake.html as the visual baseline.
Admin screens stay plain, fast, and tablet-friendly. Do not add heavy animation or decorative effects there.
Accessibility, readable contrast, and fast loading take priority over visual flourish.
