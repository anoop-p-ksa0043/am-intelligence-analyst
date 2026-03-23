---
name: project-handoff
description: Use at the end of each work session to update status, backlog, and notable decisions so another agent can continue the Account Intelligence project cleanly, especially during accounts-first rollout work.
---

# Project Handoff

Use this skill before ending a session or after landing a meaningful decision.

Read these references as needed:
- `references/current-status.md`
- `references/backlog.md`
- `references/decision-log.md`

Session SOP:
- Update `docs/handoff/current-status.md` with completed work and next tasks.
- Update the relevant architecture, data, UX, or ops doc if behavior changed.
- Update `docs/handoff/backlog.md` when priorities move.
- Record lightweight decisions in `docs/handoff/decision-log.md` if a full ADR is unnecessary.
- If a new subsystem appears, extend an existing skill reference or add a focused new skill.
- Include the active route map and rollout gate status when the revamp is feature-flagged.
- Call out whether `/legacy` is still a supported fallback and whether it remains visible in-app.

## Available Skills
| Skill | Use When |
|---|---|
| `account-intelligence-architecture` | System architecture, ADRs, data flow |
| `account-intelligence-data` | Domain types, console-types, service contracts |
| `account-intelligence-ux` | Page layouts, UI patterns, component usage |
| `account-intelligence-design-system` | Design tokens, Tailwind config, Material Symbols, primitives |
| `account-intelligence-auth` | NextAuth config, roles, session, middleware, login page |
| `account-intelligence-db` | Prisma schema, migrations, seed, db.ts, services swap |
| `account-intelligence-ops` | Runbooks, governance, observability |
| `account-intelligence-products` | Zoho product catalog, scoring rules, `lib/zoho-products.ts`, `/api/products` |
| `account-intelligence-enrichment` | AI enrichment pipeline, `lib/ai-enrichment.ts`, Claude integration, keyword fallback |
| `account-intelligence-accounts` | Account CRUD, intake flow, delete flow, Accounts Board state |
| `project-handoff` | End-of-session documentation update SOP |
