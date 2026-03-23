# Current Status

## Date
2026-03-23

## What This Project Is
**Intelligence Observer** — an internal AM/CS tooling platform that transforms public account signals into explainable Zoho product recommendations. Rules-led, human-review-gated. No autonomous customer-facing execution.

---

## Completed Work (Chronological)

### Phase 1–3 — Foundation
- Next.js 16.2.1 + TypeScript + Tailwind CSS project bootstrapped
- Full domain type system (`lib/domain.ts`) — Account, NormalizedProfile, Recommendation, Product, ProductRule, EvidenceRecord, SourceRecord, RefreshJob, RecommendationReview
- Route map: `/accounts` (Accounts Board), `/workbench/[accountId]`, `/recommendations/[id]`, `/review-queue`, `/login`
- Legacy route `/legacy` returns `notFound()` — marked `@deprecated`

### Phase 4 — UI Revamp
- "The Intelligent Observer" dark design system — tonal surface hierarchy, Material Symbols icons, Space Grotesk (headlines) + Inter (body)
- All 4 screens built: Accounts Board, Intelligence Workbench, Recommendation Detail, Review Queue
- Fully mobile responsive — bottom tab bar (mobile), 80px icon-only → 224px hover-expand sidebar (desktop)
- Role-gated UI: Manual Correction (am + data_steward), Queue resolve (am + cs), Rec review buttons (am + cs + analyst)
- Real session user initials + sign-out in sidebar

### Phase 5 — Auth + Live DB
- **NextAuth.js v5** — credentials provider, JWT strategy, 5 dev users (password: demo1234)
- **Prisma v7 + @prisma/adapter-pg** — live Neon PostgreSQL connected (`sslmode=verify-full`)
- All 13 service functions made async, Prisma DB queries replace in-memory mock store
- Mapper pattern (`mapAccount`, `mapProfile`, etc.) decouples domain types from Prisma generated types
- `proxy.ts` (renamed from `middleware.ts` per Next.js 16 convention) — route protection
- Sidebar nav: Accounts Board + Review Queue only (Workbench accessed from account row action)

### Sprint 6 — Zoho Product Suite + AI Enrichment
- **Zoho product catalog** — `lib/zoho-products.ts` — 18 real Zoho products, single source of truth:
  - Anchors (6): CRM, Desk, Books, People, Projects, One
  - Adjacent (9): Analytics, Campaigns, SalesIQ, Recruit, Inventory, Payroll, Sign, Social, Survey
  - Ecosystem enablers (3): Creator, Flow, Cliq
- 18 matching scoring rules with weighted conditions (industry, businessFunction, scale, complexity, triggerSignal, ecosystem)
- DB seeded with all 18 Zoho products + rules via `npm run db:seed`
- `GET /api/products` — read-only product catalog endpoint
- **Delete account** — trash icon (hover-reveal desktop, always-visible mobile), inline confirm bar, `DELETE /api/accounts/{id}`, optimistic UI removal
- **AI enrichment** (`lib/ai-enrichment.ts`) — Google Gemini (gemini-2.5-flash with 2.0-flash-lite → 2.0-flash → 2.5-flash fallback chain):
  - Fetches company website, strips HTML, calls Gemini for structured JSON extraction
  - Extracts: industry, subIndustry, businessFunctions, geography (HQ), operatingRegions, maturity, complexity, growthSignals, profileConfidence
  - Falls back to keyword heuristic if `GEMINI_API_KEY` absent or all models fail
- **Expanded industry list** (18 categories): saas, fintech, healthcare, manufacturing, logistics, professional services, retail, education, construction, energy, real estate, conglomerate, government, media, telecommunications, hospitality, automotive, other
- **Dual region model** — `geography` (HQ/primary region) + `operatingRegions[]` (global operations) — stored in NormalizedProfile, displayed in workbench as separate "HQ Region" and "Global Ops" cards
- Workbench metadata grid expanded to 5 cards: Industry, HQ Region, Global Ops, Maturity, Complexity
- Rationale strings improved — product-specific, names matched business functions + industry alignment
- Inference Mode displayed as "Ai" (Gemini) or "Heuristic" in Expert Context panel
- Profile Transparency panel shows matched rules including HQ + operating regions

---

## Environment Configuration

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Base URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret |
| `GEMINI_API_KEY` | Recommended | Google Gemini AI enrichment (falls back to heuristic if absent) |
| `ENABLE_REVAMP_UI` | Yes | Must be `true` |

---

## Current Assumptions
- `GEMINI_API_KEY` is a free-tier Google AI Studio key — quota limits mean `gemini-2.0-flash-lite` and `gemini-2.0-flash` often 429; `gemini-2.5-flash` currently works
- Approved public-source ingestion simulated in seed data — no live ingestion pipeline yet
- Background workers for refresh/rescoring architecturally designed but not implemented
- Analyst assignment shows "—" — no assignment model yet
- `InferenceMode` enum in Prisma: `seeded | heuristic | manual_override | ai`

---

## Next Sprint Candidates (P1)
1. Queue-backed refresh and rescoring workers (Bull/Redis or Inngest)
2. Source registry UI — list ingested sources, quality signals, re-fetch controls
3. Evidence drill-down — per-field provenance, conflict inspection, override history
4. Analyst assignment model and UI
5. Product catalog admin screen + rule version visibility

## Next Sprint Candidates (P2)
- Zoho CRM connector and field mapping
- Intelligence Drift chart (placeholder already exists in Accounts Board sidebar)
- Metrics and audit dashboard
- Pagination for large portfolios

---

## How to Run
```bash
# Install
npm install

# Configure env
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, GEMINI_API_KEY

# Push schema + seed
npx prisma db push
npm run db:seed

# Start dev server
npm run dev
```

Visit http://localhost:3000 — login with `am@internal.dev` / `demo1234`
