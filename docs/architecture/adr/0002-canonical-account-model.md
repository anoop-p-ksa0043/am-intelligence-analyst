# ADR 0002: Canonical Account Model

## Context
The BRD requires one governed account identity across current and future modules.

## Decision
Center all entities on a canonical `Account` plus alias, source, evidence, normalized profile, and recommendation records.

## Consequences
- Future modules must enrich the same account entity instead of inventing parallel record logic.
- Deterministic-first resolution and steward review remain first-class controls.
