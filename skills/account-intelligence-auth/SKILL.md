---
name: account-intelligence-auth
description: Auth layer for the Account Intelligence Platform — NextAuth.js v5, credentials provider, JWT sessions, role-aware guards, middleware, login page.
triggers:
  - Working on auth, sessions, role checking, middleware, or login page
  - Adding or changing user roles
  - Debugging redirect loops or 401/403 errors
---

# Auth Skill — Account Intelligence Platform

## Stack
- **NextAuth.js v5 beta** (5.0.0-beta.30) — `next-auth` package
- Strategy: **JWT** (no DB session table needed)
- Provider: **Credentials** (email + password, internal only)
- Roles: `am | cs | analyst | data_steward | pmm`

## Key Files
| File | Purpose |
|---|---|
| `auth.ts` | NextAuth config — providers, session callback, signIn page, role in JWT |
| `app/api/auth/[...nextauth]/route.ts` | Handler export (`GET`, `POST`) |
| `proxy.ts` | Route protection — redirects unauthenticated to `/login?callbackUrl=...` (renamed from `middleware.ts` per Next.js 16 convention) |
| `app/login/page.tsx` | Dark-themed login form + dev role quick-select |
| `lib/auth-client.ts` | Client-side hooks: `useCurrentUser()`, `hasRole(user, roles[])` |
| `app/providers.tsx` | `<SessionProvider>` wrapper |

## User Roster (dev — password: demo1234)
| Email | Role |
|---|---|
| am@internal.dev | am |
| cs@internal.dev | cs |
| analyst@internal.dev | analyst |
| steward@internal.dev | data_steward |
| pmm@internal.dev | pmm |

## Role Access Matrix
| Feature | Allowed Roles |
|---|---|
| Manual Correction panel (workbench) | am, data_steward |
| Resolve/Approve in Review Queue | am, cs |
| Recommendation review buttons | am, cs, analyst |
| All protected routes (/accounts, /workbench, /recommendations, /review-queue) | any authenticated user |

## Adding a Role
1. Add to `UserRole` union in `auth.ts`
2. Add user to `USERS` array in `auth.ts`
3. Update `hasRole()` call sites as needed

## Module Augmentation
`auth.ts` extends `next-auth` types to include `role: UserRole` on `Session.user` and `JWT`.

## Protected Routes
`proxy.ts` matcher covers:
```
/accounts/:path*, /workbench/:path*, /recommendations/:path*, /review-queue/:path*
```
Unauthenticated users are redirected to `/login?callbackUrl=<original>`.

## References
- `references/auth-config.md` — annotated auth.ts walkthrough
