# ADR 0005: Queue and Worker Model

## Context
Ingestion, normalization, refresh, and rescoring are naturally asynchronous.

## Decision
Design the service layer as if workers exist now, even though the MVP uses synchronous in-memory services.

## Consequences
- Worker contracts can be promoted to background jobs later.
- Route handlers remain thin orchestration points.
