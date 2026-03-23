---
name: account-intelligence-architecture
description: Use when working on BRD alignment, system layers, module boundaries, trust boundaries, route maps, ingestion flow, and phased onboarding for the Account Intelligence platform.
---

# Account Intelligence Architecture

Use this skill when changing architecture, flow boundaries, subsystem responsibilities, or rollout gates.

Read these references as needed:
- `references/system-overview.md`
- `references/adr-index.md`
- `references/runtime-workflows.md`

## System overview

**Intelligence Observer** — internal AM/CS tooling platform that transforms public account signals into explainable Zoho product recommendations. Rules-led, human-review-gated. No autonomous customer-facing execution.

### Stack
- **Next.js 16.2.1** (Turbopack) + TypeScript + Tailwind CSS
- **NextAuth.js v5** — JWT sessions, credentials provider
- **Prisma v7 + @prisma/adapter-pg** — Neon PostgreSQL (`sslmode=verify-full`)
- **Google Gemini** (`@google/generative-ai`) — AI enrichment pipeline
- **Material Symbols** + Space Grotesk + Inter — design system

### Route map
| Route | Purpose |
|---|---|
| `/accounts` | Accounts Board — default entry point |
| `/workbench/[accountId]` | Intelligence Workbench — account-scoped drill-down |
| `/recommendations/[id]` | Recommendation detail |
| `/review-queue` | AM/CS review queue |
| `/login` | Credentials login |
| `/legacy` | Returns `notFound()` — @deprecated |

### Data flow
```
Public website / Wikipedia
  → fetchPageText() [lib/ai-enrichment.ts]
  → Gemini structured extraction (3-model fallback)
  → Blueprint { industry, geography, operatingRegions, businessFunctions, ... }
  → NormalizedProfile (upsert in DB)
  → scoreRecommendations() [lib/services.ts]
  → Recommendation rows (DB)
  → Intelligence Workbench (UI)
  → AM/CS review gate
```

### Product catalog
- `lib/zoho-products.ts` — single source of truth (18 products + 18 scoring rules)
- Seeded to DB via `npm run db:seed`
- Classification: `anchor` | `adjacent` | `ecosystem_enabler`

### Key architectural decisions
- **Accounts-first route map** — workbench accessed via account row action, not top-level nav
- **Hard delete** — `db.account.delete()` cascades all related records
- **Gemini fallback chain** — 3 models tried in sequence; falls back to keyword heuristic if all fail
- **Dual region model** — `geography` (HQ) + `operatingRegions[]` (global ops) on NormalizedProfile
- **`proxy.ts`** (not `middleware.ts`) — Next.js 16 route protection

## Rules
- Preserve canonical account identity as the base entity for all modules.
- Keep raw-source ingestion separate from normalization and scoring.
- Do not let recommendation logic depend on uncontrolled retrieved text.
- Record architectural decisions in `docs/handoff/decision-log.md` in the same session.
- Treat the accounts-first route map and legacy retirement path as rollout concerns, not just UI concerns.
