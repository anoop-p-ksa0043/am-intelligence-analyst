---
name: account-intelligence-data
description: Use when editing schema, domain types, normalization logic, scoring contracts, confidence handling, freshness semantics, or evidence structures for the Account Intelligence platform.
---

# Account Intelligence Data

Use this skill when modifying entities, enums, contracts, seed data, or scoring logic.

Read these references as needed:
- `references/data-model.md`
- `references/scoring-contracts.md`

## Key domain types (lib/domain.ts)

### NormalizedProfile
```ts
interface NormalizedProfile {
  accountId: AccountId;
  industry?: string;        // 18-category taxonomy (see below)
  subIndustry?: string;
  businessFunctions: string[];
  geography?: string;       // HQ / primary region
  operatingRegions: string[]; // additional regions (Global Operations)
  maturity?: string;
  complexity?: string;
  growthSignals: string[];
  profileConfidence: number;
  conflictSummary: string[];
}
```

### ProfileInferenceMeta
```ts
interface ProfileInferenceMeta {
  mode: "seeded" | "heuristic" | "manual_override" | "ai";
  summary: string;
  matchedRules: string[];
  limitations: string[];
  lastEditedAt?: string;
}
```
`mode: "ai"` means Gemini-enriched profile. Corresponds to Prisma `InferenceMode.ai` enum value.

## Industry taxonomy (18 categories)
`saas`, `fintech`, `healthcare`, `manufacturing`, `logistics`, `professional services`, `retail`, `education`, `construction`, `energy`, `real estate`, `conglomerate`, `government`, `media`, `telecommunications`, `hospitality`, `automotive`, `other`

## Dual region model
- `geography` — single string, HQ/founding region
- `operatingRegions` — string array, additional active regions (never includes geography again)
- Valid values: `North America`, `EMEA`, `APAC`, `MEA`, `Latin America`, `Global`

## Rules
- Keep fit and confidence separate.
- Preserve provenance, freshness, and conflict visibility.
- Keep recommendation logic bound to normalized fields plus governed product rules.
- Update docs and handoff notes when contracts change.
- When adding new fields to `NormalizedProfile`: update `lib/domain.ts`, `prisma/schema.prisma`, the mapper in `lib/services.ts` (`mapProfile`), and `lib/mock-data.ts`.
