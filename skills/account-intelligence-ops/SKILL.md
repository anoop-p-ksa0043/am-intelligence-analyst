---
name: account-intelligence-ops
description: Use when changing governance, rollout gates, refresh handling, review queues, audit behavior, environment config, or operational readiness for the Account Intelligence platform.
---

# Account Intelligence Ops

Use this skill when changing operational rules, refresh behavior, ownership boundaries, release gates, or environment configuration.

Read these references as needed:
- `references/governance.md`
- `references/runbooks.md`

## Environment variables
| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (`sslmode=verify-full`) |
| `NEXTAUTH_URL` | Yes | Base URL — `http://localhost:3000` for dev |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret |
| `GEMINI_API_KEY` | Recommended | Google Gemini AI enrichment — falls back to keyword heuristic if absent |
| `ENABLE_REVAMP_UI` | Yes | Must be `true` |

## AI enrichment runbook

### Normal operation
- Gemini model fallback chain runs automatically: `gemini-2.0-flash-lite` → `gemini-2.0-flash` → `gemini-2.5-flash`
- Each model has its own independent free-tier daily quota
- If one model returns 429, next model is tried silently — no user-visible error

### Quota exhausted (all 3 models 429)
- All 3 model quotas exhausted simultaneously is rare on free tier
- Enrichment silently falls back to keyword heuristic (`profileConfidence: 40`)
- User sees "Heuristic" in Inference Mode; can still use Manual Correction
- Quotas reset daily — retry the next day or upgrade to paid API key

### Gemini model not found (404)
- Indicates the API key doesn't have access to that model
- Check available models at: `https://generativeai.googleapis.com/v1/models`
- Update `MODEL_FALLBACK_CHAIN` in `lib/ai-enrichment.ts` if models change

### Stuck/partial account record
If `analyzeCandidateAccount` fails mid-run, an Account may exist in DB without a NormalizedProfile. This causes the workbench to return 404.

**Fix:**
```bash
# Create scripts/_tmp_cleanup.ts:
import { db } from "../lib/db";
await db.account.deleteMany({ where: { canonicalName: "Stuck Account Name" } });
await db.$disconnect();

# Run:
npx tsx scripts/_tmp_cleanup.ts

# Delete the temp script afterward
```

## Prisma schema change procedure
1. Edit `prisma/schema.prisma`
2. `npx prisma db push` — apply to DB
3. `npx prisma generate` — regenerate client
4. `rm -rf .next` — clear Next.js compiled cache (stale chunks will use old enum values)
5. Restart dev server: `npm run dev`

## DB seeding
```bash
npm run db:seed   # upserts 18 Zoho products + rules + demo accounts
```
Safe to run multiple times (upsert pattern). Does not delete existing accounts.

## Rules
- Preserve reviewability and auditability.
- New modules require explicit readiness gates.
- Any source, access, or privacy escalation must update docs in the same session.
- AI enrichment failures must always fall back silently — no blocking error shown to user.
