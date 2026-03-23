# Data Model

## Core Entities
- `Account`: canonical organization record
- `AliasIdentifier`: alternate names, domains, and CRM references
- `SourceRecord`: where a signal came from
- `EvidenceRecord`: field-level provenance and confidence
- `NormalizedProfile`: account-level structured attributes used by scoring
- `Product`: governed product metadata
- `ProductRule`: versioned fit logic
- `Recommendation`: ranked output with fit, confidence, rationale, next action, status, and freshness
- `RecommendationReview`: human validation outcome
- `RefreshJob`: manual or scheduled refresh tracking

## Key Enums
- `account_resolution_status`: `existing | new | review_required`
- `recommendation_status`: `approved | validate_in_discovery | review_required`
- `recommendation_classification`: `anchor | adjacent | ecosystem_enabler`
- `confidence_band`: `high | medium | low`
- `source_class`: `public_website | public_newsroom | careers | registry | other_public`
- `refresh_status`: `pending | running | completed | failed | stale`

## Semantics
- Fit score answers conceptual product match.
- Confidence score answers how defensible the recommendation is.
- Conflict state captures disagreement or weakness in the normalized profile.
- Freshness state captures whether the underlying signal base is still trustworthy for action.

## Phase 1 Storage Note
The current repo uses mock seed data and an in-memory repository to keep the vertical slice runnable. PostgreSQL is the intended persistence target once migrations and environment setup are added.
