# Backlog

## P0 (Completed)
- ~~Replace seeded repository with PostgreSQL schema and seed path~~ — Done (Prisma v7 schema + seed, live Neon DB connected)
- ~~Add auth shell and role-aware route protection~~ — Done (NextAuth.js v5, proxy.ts, role-gating in all screens)
- ~~Full UI revamp to match stitch design references~~ — Done (all 4 screens, mobile responsive, design tokens)
- ~~Upgrade Next.js and resolve audit warning~~ — Done (Next.js 16.2.1)
- ~~Retire `/legacy` from in-app navigation~~ — Done (notFound(), @deprecated)
- ~~Fix feature flag bug~~ — Done (`resolveUiMode()` fixed)
- ~~Connect live PostgreSQL and run migrations + seed~~ — Done (Neon DB, sslmode=verify-full)
- ~~Swap `lib/services.ts` from mock-data to async Prisma queries~~ — Done (all 13 functions async, mapper pattern)
- ~~Zoho product catalog in DB~~ — Done (`lib/zoho-products.ts`, 18 products + rules seeded)
- ~~AI-powered account enrichment~~ — Done (`lib/ai-enrichment.ts`, Google Gemini with 3-model fallback chain, keyword fallback)
- ~~Delete account flow~~ — Done (DELETE API + trash button + inline confirm)
- ~~Dual region model~~ — Done (`geography` = HQ/primary, `operatingRegions[]` = additional regions; both shown in workbench)
- ~~Expanded industry list~~ — Done (18 categories: saas, fintech, healthcare, manufacturing, logistics, professional services, retail, education, construction, energy, real estate, conglomerate, government, media, telecommunications, hospitality, automotive, other)

## P1
- Queue-backed refresh and rescoring workers (Bull/Redis or Inngest)
- Source registry UI (list ingested sources, quality signals, re-fetch controls)
- Evidence drill-down and conflict inspection (per-field provenance, override history)
- Product catalog admin screen and rule version visibility
- Analyst assignment to accounts (currently shows "—")

## P2
- Zoho CRM connector contracts and field mapping screens
- Behavior intelligence onboarding gate checklist
- Interaction intelligence redaction rules and summary tiers
- Metrics and audit dashboard
- Pagination for large account portfolios
- Intelligence Drift chart (placeholder exists in Accounts Board sidebar)

## Acceptance Notes
- Every recommendation must show fit, confidence, rationale, freshness, and status
- Every workflow must preserve provenance and reviewability
- No endpoint may perform autonomous customer-facing execution
- Role access: Manual Correction (am, data_steward), Queue resolve/approve (am, cs), Rec review actions (am, cs, analyst)
- AI enrichment falls back to keyword heuristic silently — no error shown to user
