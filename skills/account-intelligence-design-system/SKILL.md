---
name: account-intelligence-design-system
description: Design system for the Account Intelligence Platform — "The Intelligent Observer" dark theme, Tailwind tokens, Material Symbols, Space Grotesk + Inter, all component primitives.
triggers:
  - Working on UI components, styling, or design tokens
  - Adding new screens or modifying existing component layouts
  - Debugging visual appearance, colours, or spacing issues
---

# Design System Skill — Account Intelligence Platform

## Design Reference
All screens match `stitch design/*/code.html` reference files verbatim. When in doubt, check those HTML files.

## Typography
- **Headlines**: Space Grotesk (300–700) — class: `font-headline`
- **Body**: Inter (300–700) — class: `font-sans` (default)
- Both loaded via Google Fonts in `app/layout.tsx`

## Icons
**Material Symbols Outlined** — NOT custom SVGs.
```tsx
import { Icon } from "@/components/console/primitives";
<Icon name="radar" size={22} />
<Icon name="radar" size={22} filled />  // filled variant
```
Icon names: use Material Symbols names (snake_case: `playlist_add_check`, `psychology`, etc.)

## Color Tokens (tailwind.config.ts)
| Token | Hex | Use |
|---|---|---|
| `surface` | #121416 | Root background |
| `surface-low` | #1a1c1e | Cards, panels |
| `surface-high` | #282a2c | Hover states, interactive rows |
| `surface-highest` | #333537 | Tags, chips, highest elevation |
| `primary` | #a2c9ff | Actions, links, active states |
| `primary-container` | #246cb3 | Brand buttons, logo bg |
| `tertiary` | #65de85 | Healthy / positive |
| `tertiary-fixed` | #82fb9e | Medium confidence |
| `error` | #ffb4ab | Critical / risk |
| `warning` | #F9B21D | Review required |
| `on-surface` | #e2e2e5 | Primary text |
| `on-surface-var` | #c1c7d2 | Secondary labels |
| `outline-variant` | #414751 | Subtle borders |

## Global CSS Utilities (app/globals.css)
- `.glass-panel` — `background: rgba(51,53,55,0.8); backdrop-filter: blur(20px)` — explainability drawers, right rails
- `.eyebrow` — 10px uppercase tracking-widest label
- `.input-base` — styled dark text input
- `.confidence-bar` — h-1.5 progress bar base

## Layout System
- **Left sidebar** (desktop `md+`): `w-20 h-screen fixed left-0 bg-surface` — icon-only nav
- **Top header**: `h-16 fixed top-0 md:left-20 bg-surface/90 backdrop-blur`
- **Content area**: `md:ml-20 pt-16`
- **Bottom tab bar** (mobile `<md`): `h-16 fixed bottom-0 bg-surface/95 backdrop-blur`

## Primitives (components/console/primitives.tsx)
```tsx
<Icon name="..." size={20} filled? />
<Badge tone="primary|success|warning|danger|info|neutral">{children}</Badge>
<ConfidenceBar value={0-100} tone="primary|success|warning|danger" />
<Panel className?>{children}</Panel>
<StatCard label metric tone icon sublabel? />
<SectionHeader title badge? action? />
<ConfidenceRing value={0-100} tone size label? />
```

## Border-l-4 Colour Coding
Used on recommendation/queue item cards:
- `anchor` → `border-l-primary`
- `adjacent` → `border-l-tertiary`
- `ecosystem_enabler` → `border-l-warning`
- `conflict` queue items → `border-l-error`

## Active Nav State
```
bg-primary-container/20 text-primary border-r-2 border-primary
```

## References
- `references/design-rules.md` — extended design rules and dos/don'ts
- `stitch design/*/code.html` — source-of-truth HTML reference files (in project root)
