# Skill: Account Intelligence — Account Management

## Purpose
Use this skill when working with account CRUD operations, the Accounts Board, intake flow, or delete functionality.

## Account lifecycle
```
Intake form submit
  → POST /api/accounts/intake        (domain/name match or candidate_created)
  → POST /api/accounts/analyze-candidate  (AI enrichment → NormalizedProfile + Recommendations)
  → Redirect to /workbench/{accountId}
```

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/accounts/{id}` | Get full DashboardSnapshot |
| DELETE | `/api/accounts/{id}` | Hard-delete account + all cascaded records |
| GET | `/api/accounts/{id}/signals` | Evidence records |
| GET | `/api/accounts/{id}/recommendations` | Recommendations list |
| POST | `/api/accounts/{id}/refresh` | Trigger rescoring |
| POST | `/api/accounts/{id}/workflow-action` | approve_profile / send_to_review / validate_in_discovery |
| POST | `/api/accounts/intake` | Deterministic/fuzzy match or candidate creation |
| POST | `/api/accounts/analyze-candidate` | AI enrichment + profile + recommendations |

## Delete flow
- **API:** `DELETE /api/accounts/{id}` → `db.account.delete()` with cascade (204 on success)
- **UI:** Trash icon on row (appears on hover on desktop, visible on mobile)
- **Confirm:** Inline confirm bar below the row — "Delete [name]? This is permanent."
- **Optimistic:** Row removed from state immediately, API called in background

## Accounts Board state
- `accounts` state initialized from `initialView.accounts` (SSR)
- `deleteAccountId` controls which row shows the confirm bar
- Filter is derived from `accounts` state (not `initialView.accounts`) so deleted rows disappear

## Key files
- `components/console/accounts-board.tsx` — Accounts Board + IntakeForm + delete UI
- `app/api/accounts/[id]/route.ts` — GET + DELETE
- `app/api/accounts/intake/route.ts` — intake matching
- `app/api/accounts/analyze-candidate/route.ts` — AI enrichment trigger
- `lib/services.ts` → `intakeAccount`, `analyzeCandidateAccount`, `refreshAccount`
