---
name: account-intelligence-db
description: Database layer for the Account Intelligence Platform — Prisma v7 + PostgreSQL, schema, migrations, seed, and db.ts singleton.
triggers:
  - Working on Prisma schema, migrations, DB queries, or the seed script
  - Adding new models or fields to the domain
  - Debugging Prisma connection issues
---

# Database Skill — Account Intelligence Platform

## Stack
- **Prisma v7** with `@prisma/adapter-pg` (required by Prisma v7 — no `url` in schema.prisma)
- **Neon PostgreSQL** — `sslmode=verify-full`, connected via `DATABASE_URL` in `.env.local`
- Generated client path: `generated/prisma/client` (not the default `@prisma/client`)

## Key Files
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Full domain schema — all models, enums, relations, indexes |
| `prisma/seed.ts` | Seed script — upserts 18 Zoho products + rules + demo accounts via Prisma |
| `prisma.config.ts` | Prisma v7 config — datasource URL from env (replaces `url` in schema) |
| `lib/db.ts` | Singleton PrismaClient with PrismaPg adapter |
| `lib/services.ts` | Service layer — all 13 functions async, reads/writes via Prisma (not mock-data) |
| `lib/mock-data.ts` | Static fallback used only if DB is unreachable (kept for reference) |

## Setup Commands
```bash
# 1. Create .env.local with your connection string
echo 'DATABASE_URL="postgresql://user:pass@host/db?sslmode=verify-full"' > .env.local

# 2. Push schema to DB (creates/updates tables)
npx prisma db push

# 3. Seed with Zoho products + demo data
npm run db:seed

# 4. (Optional) Open Prisma Studio
npm run db:studio
```

## Important Prisma v7 Gotchas
- **No `url` in `schema.prisma` datasource block** — connection string lives in `prisma.config.ts`
- **Import from `../generated/prisma/client`** (not `@prisma/client`)
- **Must use adapter** — `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- **Re-run `npx prisma generate`** after every schema change
- **Clear `.next` cache** after `prisma generate` — stale compiled chunks will still use old enum/types. Run: `rm -rf .next` then restart dev server.

## Models
`Account`, `AliasIdentifier`, `SourceRecord`, `EvidenceRecord`, `NormalizedProfile`, `Product`, `ProductRule`, `Recommendation`, `RecommendationReview`, `RefreshJob`

All have `@@index` on `accountId` for query performance.

## Key Schema Notes
- **`InferenceMode` enum**: `seeded | heuristic | manual_override | ai` — `ai` added for Gemini enrichment
- **`NormalizedProfile.geography`**: `String?` — HQ/primary region
- **`NormalizedProfile.operatingRegions`**: `String[]` — additional operating regions (dual region model)
- **Delete cascade**: `Account` model has `onDelete: Cascade` on all related records — a single `db.account.delete()` cleans up everything

## After Schema Changes
```bash
npx prisma db push        # apply to DB
npx prisma generate       # regenerate client
rm -rf .next              # clear Next.js compiled cache
# restart dev server
```

## References
- `references/schema-overview.md` — entity relationship summary
