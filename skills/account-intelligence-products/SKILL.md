# Skill: Account Intelligence — Product Catalog

## Purpose
Use this skill when working with the Zoho product catalog, scoring rules, product seeding, or the `/api/products` endpoint.

## Canonical catalog
- **File:** `lib/zoho-products.ts`
- Exports `ZOHO_PRODUCTS` (18 products) and `ZOHO_RULES` (18 scoring rules)
- This is the **single source of truth** — seed script, scoring engine, and API all derive from it

## Products (18 total)

| Classification | Products |
|---|---|
| **anchor** | Zoho CRM, Zoho Desk, Zoho Books, Zoho People, Zoho Projects, Zoho One |
| **adjacent** | Zoho Analytics, Zoho Campaigns, Zoho SalesIQ, Zoho Recruit, Zoho Inventory, Zoho Payroll, Zoho Sign, Zoho Social, Zoho Survey |
| **ecosystem_enabler** | Zoho Creator, Zoho Flow, Zoho Cliq |

## Scoring
- Scoring engine: `lib/services.ts` → `scoreRecommendations(accountId)`
- Reads `ProductRule` rows from DB (seeded from `ZOHO_RULES`)
- Adjacent products depend on 1–2 anchors (tracked via `dependencies[]`)
- Rationale strings name the specific product + matched business functions + industry alignment

## DB operations
- Seed: `npm run db:seed` — upserts all 18 products + rules
- Read: `GET /api/products` returns all non-deprecated products

## Adding/editing products
1. Edit `lib/zoho-products.ts` — add to `ZOHO_PRODUCTS` and a corresponding entry in `ZOHO_RULES`
2. Run `npm run db:seed` to upsert
3. Run `npx tsc --noEmit` to verify no type errors

## References
- `lib/zoho-products.ts` — catalog + rules
- `lib/services.ts` → `scoreRecommendations` — scoring engine
- `prisma/seed.ts` — seeding loop
- `app/api/products/route.ts` — GET endpoint
