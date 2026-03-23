---
name: account-intelligence-ux
description: Use when designing or implementing the workbench UI, responsive layouts, evidence-first recommendation patterns, dark-shell account navigation, or accessibility behavior for the Account Intelligence platform.
---

# Account Intelligence UX

Use this skill when working on workbench screens, states, layout behavior, and evidence presentation.

Read these references as needed:
- `references/workbench-spec.md`
- `references/design-rules.md`

## Screen map
| Route | Component | Purpose |
|---|---|---|
| `/accounts` | `components/console/accounts-board.tsx` | Accounts Board — account list, intake form, delete flow |
| `/workbench/[accountId]` | `components/console/intelligence-workbench.tsx` | Intelligence Workbench — profile, recommendations, evidence |
| `/recommendations/[id]` | Recommendation detail screen | Recommendation deep-dive |
| `/review-queue` | Review Queue | AM/CS approval queue |
| `/login` | Login page | Dark credentials form |

## Accounts Board
- Table (desktop) / card list (mobile) of all accounts
- Intake form: name + domain → AI enrichment → redirect to workbench
- Loading state: `"Fetching web data & analysing with AI…"` while `isPending`
- **Delete flow**: trash icon (hover-reveal desktop, visible mobile) → inline confirm bar below row → optimistic removal → `DELETE /api/accounts/{id}`
- `AccountRowGroup` component wraps `AccountRow + DeleteConfirmBar` to handle React Fragment keying correctly

## Intelligence Workbench
### Profile metadata grid (5 cards, 2-col mobile / 5-col desktop)
| Card | Source field |
|---|---|
| Industry | `profile.industry` |
| HQ Region | `profile.geography` |
| Global Ops | `profile.operatingRegions.join(", ")` or "—" |
| Maturity | `profile.maturity` |
| Complexity | `profile.complexity` |

### Recommendation classification colours (border-l-4)
- `anchor` → `border-l-primary` (blue)
- `adjacent` → `border-l-tertiary` (green)
- `ecosystem_enabler` → `border-l-warning` (amber)

### Expert Context panel
- Shows Inference Mode: `"Ai"` (Gemini) or `"Heuristic"` (keyword fallback)
- Profile Transparency: matched rules including HQ + operating regions
- Profile confidence ring + band

## Responsive layout
- **Desktop (md+)**: fixed 80px icon-only left sidebar, 64px top header, content area `ml-20 pt-16`
- **Mobile (<md)**: no sidebar, 64px top header, fixed bottom tab bar (Accounts + Review Queue)
- **Sidebar hover expand**: `w-20 hover:w-56` via CSS Tailwind `group/sidebar` — no JS state

## Role-gated UI
| Feature | Allowed Roles |
|---|---|
| Manual Correction panel | am, data_steward |
| Queue resolve/approve | am, cs |
| Rec review buttons | am, cs, analyst |

## Rules
- Keep the workbench decision-ready, not raw-data heavy.
- Show rationale, evidence references, freshness, and review state with every recommendation.
- Fit and confidence must remain visible and separate across responsive breakpoints.
- Preserve accessibility and task-first mobile behavior.
- Treat Accounts Board as the revamp home, with workbench detail, recommendation detail, and review queue as the primary drill-down path.
- Keep the shell dark, layered, and dense enough for account analysis without collapsing readability.
