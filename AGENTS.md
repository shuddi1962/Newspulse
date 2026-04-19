# AGENTS.md — NewsPulse PRO Build Contract

This file is the single source of truth for agents (Claude Code and any successor) working in this repo. It is versioned alongside the code so it survives context windows, new sessions, and model handoffs.

**Read this before touching anything.** The plan below is authoritative. Deviations require explicit owner approval and must be logged in the *Deviation log* section.

---

## 1. Roles

- **Owner / sole operator**: Goodnews Daniel (email: goodnewsonyematara2020@gmail.com)
- **Agent**: Claude Code (Opus family). Executes under the 20-rule strict engineering contract. No vibecoding, no invented APIs, no placeholder code, no generic AI aesthetic clichés.
- **Backend**: InsForge OSS (self-hosted). Host: `https://yb864zby.us-east.insforge.app`. Linked via `.insforge/project.json`. API key `ik_01f1d53400ea6f18dd79c37dbef1ee84` (InsForge anon key; stored locally in `.env.local`, never committed).
- **Repo**: `https://github.com/shuddi1962/Newspulse.git` (branch: `main`).

---

## 2. Current build status

| Phase | Scope | Steps | Status |
|-------|-------|-------|--------|
| 1 | Foundation (auth, schema foundation, storage, admin shell, hardening) | 1–8 in master plan; executed as 6 local steps | **COMPLETE** (commits `9a56b4f` → `604355e`, pushed to `origin/main`) |
| 2 | Core Content (CMS) | Master plan steps 9–20 | **NOT STARTED** — next up |
| 3 | Marketplace Modules | 21–27 | Not started |
| 4 | Monetization & Growth | 28–35 | Not started |
| 5 | AI & Intelligence | 36–44 | Not started |
| 6 | Polish & Scale | 45–54 | Not started |

### Phase 1 local step log (authoritative)

| Local step | Commit | What shipped |
|---|---|---|
| 1 | `9a56b4f` | Next.js 16 + strict TS + Tailwind v4 + InsForge SDK client + design tokens |
| 2 | `73560d2` | SSR auth (cookies, session helpers, login/signup/reset flows) + `(admin)` guard |
| 3 | `7434335` | Foundation schema + RLS: profiles, organizations, organization_members, categories, tags, media_assets, audit_log + auto-profile trigger + helper functions (`is_admin`, `is_org_member`, `is_org_admin`) |
| 4 | `fb8110b` | Storage buckets (`avatars`, `media`) + profile self-service page + `media_assets` upload helper with rollback |
| 5 | `ddb73e9` | Admin user directory (`admin_list_users` RPC) + role management with self-demotion guard |
| 6 | `604355e` | Error/404/global-error boundaries (root + admin-scoped) + UI primitives (Card, Alert, Badge, Skeleton) |
| 3 (full-schema top-up) | (pending commit) | Migrations 0004–0015: schema extensions, content, directory, jobs, marketplace, booking, events, real estate, classifieds, ads (11 tables), newsletter+subs+payments, platform. 72 public tables total, RLS on every one. |

### Deviation resolved (Phase 1 Step 3 full-schema)

- **Original deviation**: Phase 1 Step 3 shipped foundation tables only, deferring domain tables to the phase that owned each feature (flagged 2026-04-10).
- **Resolution (2026-04-19, owner-approved)**: the owner explicitly directed "create the full schema now, and keep going phase-by-phase" — so migrations 0004–0015 were added to complete the schema before Phase 2 begins.
- **Verification**: `SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'` returned **72** tables, all with `relrowsecurity = true`. Applied via `npx @insforge/cli db import` 0004→0015 in order; all imports returned OK.

---

## 3. Project overview (from master prompt)

**NewsPulse PRO** — production-grade all-in-one publishing and community super-platform:

- News CMS (with editorial workflow, rich editor, revisions, paywall, AI tools)
- Yelp-grade business directory
- Indeed-level job board
- Facebook Marketplace-style trading
- Booksy-level appointment booking
- Eventbrite-style event ticketing
- Zillow-level real estate listings
- Craigslist-style classifieds
- Self-serve advertising platform (rivaling Google/Meta Ads Manager)

Must look and feel like a Fortune-500 product. Editorial authority aesthetic (NYT gravitas × Airbnb polish × Stripe clarity). Zero AI-generated aesthetic clichés.

---

## 4. Backend: InsForge (EXCLUSIVE)

InsForge is the only backend. No Supabase, Firebase, Appwrite, PocketBase, or alternatives.

### SDK setup
```ts
import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  isServerMode: true, // Next.js SSR mode; manage tokens via cookies
});
```

### Services used
- **Auth**: email/password, OAuth (Google, GitHub, Facebook, Apple), magic link, 2FA, session mgmt, RBAC
- **DB**: PostgreSQL via PostgREST + full RLS
- **Storage**: S3-compatible; CDN domain in production
- **Edge Functions**: webhooks, payments, email, cron, AI pipeline
- **Realtime**: WebSocket channels (live blog, notifications, booking)
- **AI Gateway**: LLM integration (available models: deepseek-v3.2, minimax-m2.1, grok-4.1-fast, claude-sonnet-4.5, gpt-4o-mini, gemini-3-pro-image-preview)

### Rules
1. Always call docs lookup / skill file before any InsForge operation
2. Always fetch backend metadata (`npx @insforge/cli metadata`) before creating tables or functions
3. Use `@insforge/sdk` for ALL frontend integration — no raw `fetch` to PostgREST
4. For SSR, set `isServerMode: true` and manage tokens via cookies
5. Use InsForge Realtime for live features
6. Use InsForge Edge Functions for server-side logic
7. Use InsForge Storage for ALL file uploads
8. Keep schema portable to standalone PostgreSQL/AWS RDS in case of migration

---

## 5. Tech stack

### Frontend (currently installed — see `package.json` for exact versions)
- Next.js 16 App Router + React 19 + TypeScript strict
- Tailwind CSS v4 with custom design tokens (no generic presets)
- shadcn/ui base, heavily customized (no default shadcn look)
- Lucide icons (no emoji in UI)
- Fonts: **Fraunces** (headlines), **Instrument Sans** (body), **JetBrains Mono** (data)
- Tiptap v2 rich editor (not yet installed — Phase 2)
- Recharts + D3.js (not yet installed)
- React Hook Form + Zod
- Zustand + TanStack Query
- date-fns
- Sonner (toasts)
- React Email + Resend *or* InsForge Edge Functions + SES
- `sharp` + `blurhash` image pipeline (not yet installed)
- Full-text search via PostgREST; add Meilisearch if scale demands
- Mapbox GL JS (directory / real estate)
- Stripe (global), Paystack + Flutterwave (Africa), NowPayments (crypto) — all via InsForge Edge Functions

### Mobile
- PWA with service worker, offline reading, push notifications
- React Native (Expo) native apps in Phase 4

### DevOps
- Vercel (frontend), InsForge (backend), Cloudflare CDN (assets)
- GitHub Actions CI/CD
- Sentry (errors) + Vercel Analytics (perf)
- Custom domain via Vercel + InsForge

---

## 6. Design system — "Editorial Authority" aesthetic

Digital product of a major news organization crossed with a Silicon Valley startup. **NYT gravitas × Airbnb polish × Stripe clarity.**

### Color tokens (implemented in `app/globals.css` as CSS custom properties)
```css
--ink-black: #0F1419;
--ink-dark: #1A2332;
--ink-medium: #374151;
--pure-white: #FFFFFF;
--warm-paper: #FAFAF8;
--cool-gray-50: #F9FAFB;

--signal-red: #DC2626;    /* breaking news, alerts, CTAs — NOT decoration */
--ocean-blue: #2563EB;
--forest-green: #059669;

--gray-100 … --gray-600: standard scale

--cat-politics: #7C3AED;
--cat-business: #2563EB;
--cat-tech: #0891B2;
--cat-sports: #059669;
--cat-lifestyle: #D97706;
--cat-world: #DC2626;
```

### Rules (non-negotiable)
1. **NO emoji in production UI** — Lucide only (emoji permitted sparingly in alerts/notifications)
2. **NO gradient backgrounds** — flat fills, subtle borders, restrained shadows
3. **NO `rounded-full` on cards** — max `rounded-lg` (8px) or `rounded-xl` (12px)
4. **Admin sidebar is dark** (`ink-black`), not colorful
5. **Real photography** — Unsplash/Pexels for demo data, never colored boxes or emoji placeholders
6. **Whitespace is sacred** — generous padding, clear hierarchy
7. **Border-based card separation** (`border border-gray-200`), not heavy shadows
8. **Clear typographic scale** — H1 > H2 > H3 > body > caption
9. **Data-dense admin dashboards** — rich but not cluttered
10. **Micro-interactions** — 150–200ms transitions, skeleton loaders, optimistic updates
11. **Full dark mode** — system-adaptive + manual toggle, preference persisted
12. **Mobile-first** — every page responsive, touch-optimized, tested at 375px

---

## 7. Database schema (master list)

The full schema below is the target end-state. Build only what each phase requires (see deviation note in §2).

### Core (Phase 1 — shipped)
- `auth.users` (InsForge-managed)
- `profiles` (id FK → auth.users, display_name, username, role, avatar_url, bio, website_url, created_at, updated_at) — `role` enum: `reader | author | editor | admin`
- `organizations` (id, slug, name, description, created_at, updated_at)
- `organization_members` (org_id, user_id, role) — `org_role` enum: `owner | admin | member`
- `categories` (id, kind, slug, name, parent_id, position, is_active) — `category_kind` enum: `news | directory | jobs | marketplace | events | real_estate | classifieds`
- `tags` (id, slug, name, usage_count)
- `media_assets` (id, owner_id, bucket, key, mime_type, size_bytes, width, height, created_at)
- `audit_log` (id, actor_id, action, entity_type, entity_id, metadata, ip_address, created_at) — append-only

### Content (Phase 2)
- `articles` (id, title, slug, excerpt, content_json, content_html, featured_image, gallery_images[], author_id, category_id, subcategory_id, tags[], status, publish_at, is_breaking, is_featured, is_premium, reading_time_min, word_count, seo_*, og_image, canonical_url, schema_json, language, allow_comments, view_count, share_count, created_at, updated_at) — status enum: `draft | review | approved | scheduled | published | archived | rejected`
- `article_tags` (article_id, tag_id)
- `article_revisions` (id, article_id, content_json, revised_by, revision_note, created_at)
- `videos` (id, title, slug, description, video_url, thumbnail_url, duration_seconds, author_id, category_id, tags[], status, is_featured, view_count, created_at)
- `comments` (id, article_id, user_id, parent_id, content, status, likes_count, reported_count, ip_address, created_at) — status: `pending | approved | spam | rejected`
- `polls` / `poll_votes`
- `rss_internal_feeds` / `rss_external_sources`

### Directory / Jobs / Marketplace / Booking / Events / Real Estate / Classifieds (Phase 3)
See master prompt §"Database Schema" for full DDL; will be migrated phase-by-phase.

### Ads + Newsletter + Subscriptions + Payments (Phase 4)
See master prompt §"Database Schema".

### Notifications, reports, settings, languages, analytics (Phase 5/6)
See master prompt §"Database Schema".

---

## 8. Public routes (map)

Organized exactly as in the master prompt. Not all routes exist yet — they are created phase-by-phase. Summary:

- **Reader**: `/`, `/[category]`, `/[category]/[slug]`, `/video`, `/live`, `/search`, `/archive`, `/author/[username]`, `/opinion`, `/polls`
- **Directory**: `/directory*`
- **Jobs**: `/jobs*`
- **Marketplace**: `/marketplace*`
- **Booking**: `/booking*`
- **Events**: `/events*`
- **Real estate**: `/real-estate*`
- **Classifieds**: `/classifieds*`
- **Monetization**: `/subscribe`, `/newsletter`
- **Auth**: `/login`, `/signup`, `/forgot-password`, `/reset-password` (shipped Phase 1 Step 2)
- **Account**: `/account*`
- **Advertiser self-serve**: `/advertise`, `/advertise/signup`, `/ads*`
- **Admin**: `/admin*` (shell + users shipped Phase 1)
- **Custom pages + sitemap + RSS**: `/pages/[slug]`, `/rss`, `/sitemap.xml`

Full route list in master prompt §"FRONTEND PAGES & ROUTES" — do not paraphrase when implementing, copy the exact slugs.

---

## 9. Advertising platform (Phase 4)

Full sales-page landing at `/advertise` with: hero, animated audience stats, ad format showcase, targeting capabilities, pricing table, case studies, how-it-works, self-serve vs managed comparison, FAQ, media kit download, contact form.

**Campaign wizard (6 steps):** Objective → Audience → Placement & Format → Budget & Bidding → Creative → Review & Launch.

**Ad formats:** display banner (728×90, 300×250, 300×600, interstitial), native article, sponsored content, video pre-roll, in-feed native, newsletter sponsor, push notification, directory featured, job featured, marketplace featured, event promoted, property spotlight.

**Bid types:** CPM, CPC, CPA, CPV, CPI, flat rate.

**Analytics:** overview, time-series, placement breakdown, creative comparison, audience insights, geographic heatmap, device breakdown, conversion funnel, CSV/PDF export, real-time updates.

**Admin review:** approval queue with creative preview, approve/reject with reason, auto-rejection rules (blocked keywords/categories/domains), revenue dashboard.

---

## 10. AI features (Phase 5)

1. AI content writer (drafts from topic, tone rewrites, social copy)
2. AI headline generator (5–10 variations, auto A/B)
3. Smart summarization (TL;DR, takeaways)
4. Auto-tagging (NLP)
5. Content scoring (predict performance pre-publish)
6. AI translation with human review
7. AI image generation for featured images
8. Dynamic paywall intelligence (per-reader propensity)
9. Smart recommendations (reading-history-based)
10. AI comment moderation (safe/review/spam/toxic)
11. AI ad optimization (auto creative rotation, bid adjust, targeting)
12. Text-to-speech narration
13. Semantic smart search

All AI calls go through InsForge AI Gateway.

---

## 11. Build sequence (verbatim from master prompt)

### Phase 1 — Foundation (weeks 1–3)
1. Initialize Next.js 15 project with TypeScript, Tailwind, shadcn/ui
2. Set up InsForge project, create SDK client, configure auth
3. Create complete database schema in InsForge (all tables above) *— see deviation note §2*
4. Set up Row Level Security policies
5. Build design system
6. Build authentication flows
7. Build admin layout
8. Build public layout

### Phase 2 — Core Content (weeks 4–6) — **NEXT UP**
9. Article editor (Tiptap) with all extensions
10. Article CRUD with editorial workflow (draft → review → approve → schedule → publish)
11. Category and tag management
12. Media library with upload, organize, search
13. Homepage with featured articles, category sections, breaking news
14. Article detail page with full SEO, schema markup, social sharing
15. Category pages with pagination
16. Search functionality
17. Comment system with moderation
18. Video post management
19. RSS feeds (internal + external)
20. Multi-language support framework

### Phase 3 — Marketplace Modules (weeks 7–10)
21. Business directory
22. Job board
23. Marketplace
24. Booking system
25. Events
26. Real estate
27. Classifieds

### Phase 4 — Monetization & Growth (weeks 11–14)
28. Subscription system (Stripe/Paystack/Flutterwave)
29. Self-serve ad platform (account, wizard, creative, targeting, budget)
30. Ad serving engine (impression tracking, click tracking, frequency capping, A/B rotation)
31. Advertiser analytics dashboard
32. Advertising landing page
33. Ad review/moderation admin
34. Newsletter engine
35. Dynamic paywall with AI intelligence

### Phase 5 — AI & Intelligence (weeks 15–17)
36. AI writer (InsForge AI Gateway)
37. Auto-tagging / categorization
38. Smart summarization
39. Headline A/B testing
40. Content scoring and recommendations
41. AI comment moderation
42. Text-to-speech
43. Smart semantic search
44. Ad optimization engine

### Phase 6 — Polish & Scale (weeks 18–20)
45. Analytics dashboard (real-time, content, audience, revenue)
46. SEO optimization (sitemaps, schema, CWV, AMP)
47. Social auto-publishing
48. PWA (service worker, offline, push)
49. Dark mode
50. Performance (caching, image pipeline, DB indexes)
51. Security hardening (rate limits, WAF, bot detection, audit trail)
52. GDPR/CCPA compliance
53. Theme customization system
54. Comprehensive testing and QA

---

## 12. Critical rules (non-negotiable)

1. **InsForge is the only backend.** No Supabase/Firebase/Appwrite/PocketBase.
2. **No AI aesthetic clichés.** No purple gradients, no Inter font, no emoji-heavy UI, no rounded-full cards.
3. **Production-ready code.** TypeScript strict, proper error handling, loading states, empty states, error boundaries.
4. **Mobile-first.** Every page responsive and tested at 375px.
5. **SEO-first.** Proper meta, OG tags, schema markup, semantic HTML on every public page.
6. **Performance-first.** 95+ Lighthouse, all Core Web Vitals green.
7. **Accessibility.** WCAG 2.1 AA, ARIA labels, keyboard nav, screen reader support.
8. **Security-first.** Input sanitization, CSRF, rate limiting, XSS prevention, parameterized queries (PostgREST handles; still validate inputs).
9. **Real images.** Unsplash API or placeholder services for demo data, never colored boxes.
10. **Skeleton loaders** — never empty blank pages while loading.
11. **Optimistic updates** with rollback on error.
12. **Graceful error pages** — 404, 500, toast notifications for user actions.
13. **Dark mode** — system-detect + manual toggle, persisted.
14. **i18n-ready.** Strings extractable, RTL support, locale-aware date/number formatting.
15. **No file over 300 lines.** Extract when approaching.
16. **No `any` types.** Use `unknown` + narrowing, or concrete types.
17. **Every InsForge op preceded by docs/skill lookup.** No guessed APIs.
18. **Server-side validation + RLS** on every data op.
19. **No placeholder code.** No `TODO`, no `// implement later`, no lorem ipsum.
20. **Sandbox workaround:** network calls (`npm`/`git`/`npx`) require `dangerouslyDisableSandbox: true` in the Bash tool.

---

## 13. Environment variables

```env
NEXT_PUBLIC_INSFORGE_URL=https://yb864zby.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_xxx       # project anon key (safe to expose)
INSFORGE_SERVICE_KEY=sk_xxx                # server-only

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=

RESEND_API_KEY=

OPENAI_API_KEY=
ANTHROPIC_API_KEY=

NEXT_PUBLIC_MAPBOX_TOKEN=

NEXT_PUBLIC_GA_ID=
SENTRY_DSN=

NEXT_PUBLIC_SITE_URL=https://newspulse.com
NEXT_PUBLIC_SITE_NAME=NewsPulse PRO
```

**Never commit `.env.local`.** Use InsForge `secrets` for server-side env in production.

---

## 14. Agent operating protocol

When starting a new session or resuming work:

1. **Read this file first.** The plan above is authoritative.
2. **Read `memory/MEMORY.md`** (at `C:\Users\USER\.claude\projects\c--Users-USER-Desktop-Newspulse-Pro\memory\`) for session-persisted context.
3. **Run `git log --oneline -8`** to confirm current state matches §2 status table. If it doesn't, update §2 and call it out.
4. **Run `npx @insforge/cli metadata --json`** (with `dangerouslyDisableSandbox: true`) before any InsForge schema work to see what's actually deployed.
5. **Identify the next step** from §11 build sequence based on §2 status.
6. **Plan** — for non-trivial tasks, use TodoWrite and surface the plan before implementing.
7. **Execute** — one local step per commit, commit message format: `[scope] feat: Phase N Step M — short description`.
8. **Verify** — typecheck + lint + build must all pass clean. For UI work, smoke-test the actual page in a browser (can't be skipped by "types compiled" alone).
9. **Update §2** in this file when a local step ships, and update the *Deviation log* if anything strayed from the master prompt.
10. **Push to `origin/main`** only after owner confirmation (confirmed standing: each committed step is pushed immediately).

---

## 15. Deviation log

| Date | Deviation | Reason | Status |
|------|-----------|--------|--------|
| 2026-04-10 (approx) | Phase 1 Step 3 shipped foundation tables only, not full schema | Premature infrastructure for unbuilt features violates rule 19 (no placeholder code) | **Resolved 2026-04-19**: owner directed full schema up-front. Migrations 0004–0015 added: content, directory, jobs, marketplace, booking, events, real estate, classifieds, ads, newsletter+subs+payments, platform. 72 public tables total, RLS on every one. |

---

*File version: 1.1. Owned by: Goodnews Daniel. Last ship: migrations 0004–0015 (Phase 1 Step 3 full-schema top-up, 2026-04-19).*
