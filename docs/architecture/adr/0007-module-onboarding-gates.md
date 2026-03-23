# ADR 0007: Module Onboarding Gates

## Context
The BRD explicitly rejects loading future modules just because data exists.
The accounts-centered revamp shipped behind a feature flag so legacy navigation could continue until the new routes were ready for default entry.

## Decision
Treat CRM, behavior, and interaction intelligence as gated modules with documented readiness checks.

## Consequences
- Future integrations must prove identity, access, governance, and quality readiness before release.
- Phase boundaries stay product and governance driven, not connector driven.
- Legacy retirement decisions are treated as rollout gates, not just UI preferences.
