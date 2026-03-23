# Runtime Workflows

## Navigation Context
- Default entry: Accounts Board at `/`
- Account drill-down: `/workbench/[accountId]`
- Recommendation decision: `/recommendations/[id]`
- Cross-account exception handling: `/review-queue`
- Legacy fallback: `/legacy`

## Account Intake and Resolution
- Trigger: organization name, domain, or CRM reference entered
- Deterministic identifiers outrank fuzzy match logic
- Medium-confidence fuzzy matches route to review
- Output: existing account, new candidate, or review-required state

## External Intelligence Ingestion
- Trigger: intake, scheduled refresh, or manual refresh
- Approved public sources only in phase 1
- Output: source records plus structured evidence with provenance and quality tags

## Normalization
- Trigger: evidence package ready
- Controlled vocabulary only
- Conflicts remain visible
- Output: normalized profile with profile confidence and conflict summary

## Product Knowledge
- Trigger: taxonomy or rule changes
- Product catalog remains governed and versioned
- Output: active product rules for the fit engine

## Fit and Recommendation
- Trigger: normalized profile plus active product rules
- Rules-led scoring first, explanation second
- Output: ranked recommendations with fit, confidence, rationale, next-best action, and status

## Validation and Action
- Trigger: recommendation set ready
- High confidence: approved
- Medium confidence: validate in discovery
- Low confidence or conflict: review required
- Account-level and recommendation-level decisions must remain visible when returning to Accounts Board

## Refresh and Resync
- Trigger: scheduled cadence or manual refresh
- Refresh status and staleness remain visible
- Material changes can rescore recommendations
- Freshness changes may update board and queue states even when confidence does not change
