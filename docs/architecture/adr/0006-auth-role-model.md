# ADR 0006: Auth and Role Model

## Context
The BRD requires controlled visibility, auditability, and future sensitive-data gating.

## Decision
Prepare for internal SSO and role-aware workbench surfaces from day one.

## Consequences
- Current MVP is single-user seeded, but docs and services assume authenticated roles.
- Sensitive future modules can inherit existing role boundaries instead of retrofitting them.
