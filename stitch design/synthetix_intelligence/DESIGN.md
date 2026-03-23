# Design System Document

## 1. Overview & Creative North Star: The Intelligent Observer

This design system is engineered to transform complex account data into a premium, editorial-grade intelligence experience. We move away from the cluttered, "boxed-in" feel of traditional enterprise SaaS, adopting a Creative North Star we call **"The Intelligent Observer."**

The objective is to create a UI that feels like a high-end command center—authoritative, futuristic, yet operationally silent. We achieve this through a "No-Line" philosophy, leveraging tonal depth and sophisticated typography rather than rigid borders. By using intentional asymmetry in signal panels and overlapping "glass" surfaces for explainability drawers, we ensure the platform feels forward-looking and bespoke.

---

## 2. Colors & Surface Architecture

Our palette is rooted in deep neutrals to reduce cognitive load and establish a "pro" atmosphere. 

### The Palette
- **Core Neutrals:** `surface` (#121416) for the primary background, transitioning through `surface-container-low` (#1a1c1e) and `surface-container-highest` (#333537).
- **Primary Action:** `primary` (#a2c9ff) for interactive states and `primary-container` (#246cb3) for brand-heavy navigation elements.
- **Semantic Accents:** 
    - Critical/Risk: `error` (#ffb4ab)
    - Warning/Medium Confidence: `tertiary_fixed` (#82fb9e) / Custom Yellow (#F9B21D)
    - Positive/Healthy: `tertiary` (#65de85)

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define layout sections. 
Boundaries must be defined by background shifts. A recommendation card (`surface-container-low`) should sit on the dashboard shell (`surface`) without a stroke. Separation is achieved through contrast, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
- **Level 0 (Base):** `surface` - The workspace floor.
- **Level 1 (Panels):** `surface-container-low` - Large intelligence panels.
- **Level 2 (Cards):** `surface-container-high` - Individual account signals or recommendation cards.
- **Level 3 (Interlays):** `surface-bright` - Active or hovered states.

### The "Glass & Gradient" Rule
For side drawers and floating "explainability" panels, use Glassmorphism. Apply `surface-container-highest` at 80% opacity with a `backdrop-blur` of 20px. This allows the underlying account data to bleed through subtly, maintaining context while focusing the user's attention.

---

## 3. Typography: Editorial Authority

We use a high-contrast pairing to balance technical precision with futuristic elegance.

- **Display & Headlines:** **Space Grotesk.** This is our "voice." Use `display-lg` (3.5rem) and `headline-md` (1.75rem) for major data points and page titles. Its geometric, slightly tech-forward feel establishes the "Futuristic" brief.
- **Interface & Body:** **Inter.** Chosen for its extreme legibility at small sizes. All system labels, body text, and intelligence signals use Inter.

**Hierarchy Tip:** Always use `on-surface-variant` (#c1c7d2) for secondary labels to create a natural visual "recession" compared to the high-contrast `on-surface` (#e2e2e5) primary text.

---

## 4. Elevation & Depth: Tonal Layering

Shadows and lines are secondary to tonal shifts. We convey importance through "lift" created by light.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card on a `surface-container-low` section creates a soft, natural inset.
- **Ambient Shadows:** For floating elements (e.g., side drawers), use a massive blur (40px+) with low opacity (6%) using a tinted version of the primary color. This mimics the glow of a high-end screen rather than a "drop shadow."
- **The Ghost Border Fallback:** If a border is required for accessibility, use `outline-variant` (#414751) at 20% opacity. It should be barely perceptible.

---

## 5. Components

### Dashboard Shells & Intelligence Panels
Panels should use `0.5rem (lg)` roundedness. Avoid a symmetrical grid; allow "Signal Radar" panels to vary in width based on data density to create a more custom, "Intelligence Bureau" layout.

### Recommendation Cards
- **Background:** `surface-container-low`.
- **Classification Chips:** 
    - **Anchor:** `error_container` background with `on_error_container` text.
    - **Adjacent:** `primary_container` background with `on_primary_container` text.
    - **Enabler:** `tertiary_container` background with `on_tertiary_container` text.
- **Rule:** No dividers between "Fit Score" and "Rationale." Use `1.1rem (5)` vertical spacing to separate content blocks.

### Side Drawers (Explainability)
Drawers should slide from the right using the **Glassmorphism** rule. The "why it fits" rationale should be set in `body-md` with `title-sm` headers.

### Buttons & Inputs
- **Primary Button:** Use a subtle linear gradient from `primary` to `primary_container`. Roundedness: `0.375rem (md)`.
- **Input Fields:** `surface-container-lowest` background with no border. On focus, use a `1px` outer glow of `primary` (40% opacity).

---

## 6. Do’s and Don’ts

### Do
- **DO** use white space as a structural element. If two pieces of data feel cluttered, increase the spacing to `1.75rem (8)` rather than adding a line.
- **DO** use `Space Grotesk` sparingly for numbers and titles to maintain its impact.
- **DO** ensure high contrast for "Critical" states (#E42527) against the dark background.

### Don't
- **DON'T** use pure black (#000000) or pure white (#FFFFFF). Stick to the palette's charcoal and off-white tones to keep the experience "premium."
- **DON'T** use traditional Material Design shadows. They look too "consumer." Stick to tonal shifts and ambient glows.
- **DON'T** crowd the dashboard. If an account signal isn't "High Confidence," move it to a lower surface tier (`surface-container-lowest`) to visually deprioritize it.