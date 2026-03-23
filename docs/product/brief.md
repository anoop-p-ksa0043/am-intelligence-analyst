# Product Brief

## Goal
Build an internal AM/CS account intelligence experience that starts from Accounts Board, converts approved public account signals into a normalized account profile, correlates that profile against governed product logic, and presents explainable recommendations with next-best actions.

## Primary Users
- AM/CS users
- Product owner
- Business analyst / strategy owner
- Data steward
- Product operations / PMM

## Phase 1 Scope
- Canonical account resolution
- Approved public-source ingestion only
- Structured evidence store with provenance and confidence
- Normalized account profile
- Governed product knowledge base
- Fit and confidence scoring
- Validation workflow
- Responsive workbench UI
- Accounts-first navigation with `/accounts`, `/workbench/[accountId]`, `/recommendations/[id]`, and `/review-queue`
- Accounts Board as the default root experience, with legacy continuity preserved at `/legacy`

## Out of Scope
- Partner/SI external experiences
- Autonomous outreach
- Autonomous CRM write-back
- Behavior and interaction intelligence modules
- People-level profiling

## Success Measures
- Recommendations always show evidence, rationale, freshness, and review state
- Fit and confidence remain structurally separate
- Duplicate-account risk is controlled through deterministic-first resolution
- Phase 2+ module seams exist without changing core account identity logic
- The accounts-first revamp remains the default entry without losing access to the legacy fallback

## Constraints
- Rules-led scoring first, AI explanation second
- Raw retrieved text cannot directly trigger recommendations
- Company-level, data-minimization-first posture
- Human review remains in control for medium/low-confidence outputs
