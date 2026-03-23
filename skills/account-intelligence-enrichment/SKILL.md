# Skill: Account Intelligence — AI Enrichment

## Purpose
Use this skill when working with the account enrichment pipeline, web scraping, Gemini integration, or the intake flow.

## Overview
When a new account is submitted via the intake form, `analyzeCandidateAccount` in `lib/services.ts` calls `enrichAccountFromWeb` from `lib/ai-enrichment.ts`. This replaces the old keyword heuristic with live web + AI analysis.

## Pipeline
1. **Fetch** `https://{domain}` — strips HTML tags + collapses whitespace, takes first 4,000 chars of visible text (8s timeout)
2. **Supplement** with `https://en.wikipedia.org/wiki/{name}` if website returns < 200 chars
3. **Gemini call** — always called when `GEMINI_API_KEY` is present, even if website text is empty (Gemini infers from name + domain):
   - Model fallback chain: `gemini-2.0-flash-lite` → `gemini-2.0-flash` → `gemini-2.5-flash`
   - Each model has its own independent free-tier quota bucket
   - If one model returns 429 (quota exhausted), automatically tries the next
4. **Fallback to keyword heuristic** if:
   - `GEMINI_API_KEY` is not set
   - All 3 Gemini models fail (429, 404, or other error)
   - Response JSON is unparseable

## Returned Blueprint type
```ts
interface Blueprint {
  industry: string;        // one of 18 categories (see below)
  subIndustry: string;
  businessFunctions: string[];
  geography: string;          // HQ / primary region
  operatingRegions: string[]; // additional operating regions (omits HQ region)
  maturity: string;
  complexity: string;
  growthSignals: string[];
  profileConfidence: number;  // 0–100
  inferenceMeta: {
    mode: "ai" | "heuristic";
    summary: string;
    matchedRules: string[];
    limitations: string[];
  };
}
```

## Industry taxonomy (18 categories)
`saas`, `fintech`, `healthcare`, `manufacturing`, `logistics`, `professional services`, `retail`, `education`, `construction`, `energy`, `real estate`, `conglomerate`, `government`, `media`, `telecommunications`, `hospitality`, `automotive`, `other`

## Dual region model
- **`geography`** — HQ or founding region (single string). One of: `North America`, `EMEA`, `APAC`, `MEA`, `Latin America`, `Global`. Use `MEA` for Gulf/Middle Eastern companies. `Global` only if no identifiable home region.
- **`operatingRegions`** — additional regions where company actively operates (array, excludes HQ region). Same set of valid values.

## Configuration
- `GEMINI_API_KEY` must be set in `.env.local`
- Without it, enrichment silently falls back to keyword heuristic (profileConfidence: 40)
- Fetch timeout: 8 seconds per URL

## Gemini quota handling
Free-tier API keys have daily quota per model. When quotas are exhausted (429), the fallback chain ensures continued operation:
1. `gemini-2.0-flash-lite` — try first (smallest quota bucket)
2. `gemini-2.0-flash` — fallback if lite quota exhausted
3. `gemini-2.5-flash` — final fallback (larger quota, currently available)
If all models fail, falls back to keyword heuristic.

## InferenceMode in DB
Prisma `InferenceMode` enum: `seeded | heuristic | manual_override | ai`
- `ai` — Gemini-enriched profile
- `heuristic` — keyword fallback
- After any Prisma enum change: `npx prisma db push && npx prisma generate`, then clear `.next` cache and restart dev server

## UX
- Intake button shows: "Fetching web data & analysing with AI…" while `isPending`
- Workbench **Expert Context** panel shows Inference Mode: "Ai" (Gemini) or "Heuristic"
- Workbench metadata grid shows 5 cards: Industry, HQ Region, Global Ops, Maturity, Complexity
- Profile Transparency panel shows matched rules including HQ + operating regions

## References
- `lib/ai-enrichment.ts` — enrichment pipeline (fetch + Gemini + fallback)
- `lib/services.ts` → `analyzeCandidateAccount` — calls enrichment, upserts NormalizedProfile
- `components/console/accounts-board.tsx` → `IntakeForm` — loading state
- `components/console/intelligence-workbench.tsx` — HQ Region + Global Ops metadata cards
- `.env.local` / `.env.example` — GEMINI_API_KEY
- `prisma/schema.prisma` — `InferenceMode` enum, `NormalizedProfile.operatingRegions`
