# System Overview

## Layers
- Foundation: account, alias, evidence, source registry, audit, refresh controls
- Intelligence: approved public-source ingestion and governed product knowledge
- Decisioning: normalization, fit engine, recommendation engine, validation workflow
- Presentation: Accounts Board, workbench detail, recommendation review, and queue surfaces

## Data Flow
1. Intake receives organization name, domain, or CRM reference.
2. Account resolution finds an existing canonical account or creates a candidate.
3. Approved public sources generate source records and evidence records.
4. Normalization converts evidence into a structured account profile.
5. Fit engine combines normalized attributes with active product rules.
6. Recommendation workflow assigns fit, confidence, rationale, next action, and review state.
7. Workbench presents outputs with provenance, freshness, and conflict visibility.

## Trust Boundaries
- All retrieved source content is untrusted.
- Only structured, schema-defined fields flow into scoring.
- Recommendations are generated from normalized attributes plus governed product rules.
- Review decisions are logged, not silently folded into rule logic.

## Runtime Notes
- Current implementation uses an in-memory seed repository for a runnable MVP.
- Production path replaces the repository with PostgreSQL and queue-backed jobs.
- Route contracts are already aligned to the future production surface.
- The revamp shipped as a feature-flagged rollout and is now the default root experience.
- Legacy continuity is preserved at `/legacy`.

## Route Map
- `/` - redirects to `/accounts`
- `/accounts` - Accounts Board, the primary entry point
- `/workbench/[accountId]` - account-centered workbench detail
- `/recommendations/[id]` - recommendation detail and review surface
- `/review-queue` - cross-account review queue
- `/legacy` - legacy single-page workbench fallback

## Phase Expansion
- Phase 2: Zoho CRM connectors and account-truth reconciliation
- Phase 3: behavior intelligence
- Phase 4: interaction intelligence with redaction and role controls
- Future: predictive plays and controlled downstream execution
