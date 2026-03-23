# ADR 0004: Scoring and Confidence Separation

## Context
The BRD requires fit and confidence to remain separate in both data model and UI.

## Decision
Represent `fitScore`, `confidenceScore`, and `confidenceBand` as separate recommendation fields.

## Consequences
- A conceptually strong recommendation can still present low confidence when evidence quality is weak.
- UI must show both scores everywhere a recommendation is surfaced.
