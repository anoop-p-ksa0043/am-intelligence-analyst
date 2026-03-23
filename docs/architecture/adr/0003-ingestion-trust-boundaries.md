# ADR 0003: Ingestion Trust Boundaries

## Context
Approved public sources are allowed in phase 1, but raw content is untrusted.

## Decision
Persist provenance-rich structured evidence and prevent recommendation logic from reading raw retrieved text directly.

## Consequences
- Sanitization and extraction remain explicit pipeline stages.
- Future AI helpers, if introduced, cannot bypass normalization and rule governance.
