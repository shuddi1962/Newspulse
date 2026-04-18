# NewsPulse PRO

A production-grade, all-in-one publishing and community super-platform:
news CMS, business directory, job board, marketplace, booking, events, real
estate, classifieds, and a self-serve ad platform — on a single Next.js 15 +
InsForge stack.

## Status

Phase 1 — Foundation. Project scaffold, design system, fonts, strict
TypeScript and ESLint are wired up. Backend is linked to InsForge (OSS). Auth
flows, content modules, monetisation and AI features come in later phases.

## Stack

- **Frontend** — Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui
- **Typography** — Fraunces (display) · Instrument Sans (body) · JetBrains Mono (data)
- **State & forms** — Zustand, TanStack Query, React Hook Form + Zod
- **Icons** — Lucide React (no emoji in production UI)
- **Backend** — [InsForge](https://insforge.dev): PostgreSQL + PostgREST, Auth,
  Storage, Realtime, Edge Functions, AI Gateway
- **Payments** — Stripe (global), Paystack + Flutterwave (Africa), NowPayments (crypto)
- **Hosting** — Vercel (frontend) + InsForge (backend)

## Getting started

```bash
# 1. Install deps
npm install

# 2. Copy environment template and fill it in
cp .env.example .env.local

# 3. Fetch the InsForge anon key
npx @insforge/cli secrets get ANON_KEY

# 4. Run the dev server
npm run dev
```

Open <http://localhost:3000> to view the app.

## Useful scripts

| Command              | What it does                                           |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Start the Next.js dev server with Turbopack           |
| `npm run build`      | Production build                                       |
| `npm run start`      | Start the production server                            |
| `npm run lint`       | Run ESLint (`--fix` to auto-repair)                   |
| `npm run typecheck`  | Run `tsc --noEmit` against the whole project          |
| `npm run format`     | Run Prettier in write mode                             |

## InsForge backend

The project is linked to an InsForge OSS project (`.insforge/project.json`).
Use the InsForge CLI for all backend infrastructure operations — schema
migrations, storage buckets, edge functions, secrets, and logs:

```bash
npx @insforge/cli metadata              # overview of auth, DB, storage, functions, AI
npx @insforge/cli db query "…"          # run SQL
npx @insforge/cli storage list          # list buckets
npx @insforge/cli functions deploy …    # deploy an edge function
```

Agent skills for InsForge live in `.agents/skills/` and describe the exact
SDK and CLI conventions that frontend/backend code should follow.

## Engineering contract

This project is governed by a strict 20-rule [engineering standards
document](./docs/engineering-standards.md) (see Phase 2 when `docs/` lands).
Highlights:

- No `any` types. No placeholder code. No 500-line components.
- Every data operation handles loading, success, and error states.
- Database queries are paginated and indexed. No `select('*')` in lists.
- Payments and admin endpoints re-authorise on the server.
- Real imagery only — no colored boxes or emoji placeholders.
- Dark mode, mobile-first, WCAG 2.1 AA for every page.

## License

Proprietary — © NewsPulse PRO.
