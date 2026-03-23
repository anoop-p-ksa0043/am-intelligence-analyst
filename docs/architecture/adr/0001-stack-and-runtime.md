# ADR 0001: Stack and Runtime

## Context
The app needs a modern internal web experience, strong type safety, and clean seams for future queue-backed workflows.
The revamp originally needed a feature-flagged root swap so the new accounts-centered UI could ship without removing the legacy surface.

## Decision
Use Next.js with TypeScript and Tailwind CSS for the UI and route layer.

## Options Considered
- Next.js custom app
- Zoho Creator-first implementation
- Hybrid front-end plus embedded Zoho workflows

## Consequences
- We keep full control over responsive UX and information density.
- Phase 1 uses mock-backed services now and can move to PostgreSQL later without changing the route contracts.
- The accounts-first route map is now the default root experience.
- Legacy continuity remains available at `/legacy` until removal is explicitly approved.
