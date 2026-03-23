import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy — "No-Line" tonal layering
        surface: "#121416",           // Level 0 — page background
        "surface-low": "#1a1c1e",     // Level 1 — panels, cards
        "surface-high": "#282a2c",    // Level 2 — hover states, nested panels
        "surface-highest": "#333537", // Level 3 — chips, tags, inputs

        // Brand / interactive
        primary: "#a2c9ff",
        "primary-container": "#246cb3",

        // Semantic accents
        tertiary: "#65de85",          // healthy / positive / approved
        "tertiary-fixed": "#82fb9e",  // medium confidence
        error: "#ffb4ab",             // critical / risk / conflict
        warning: "#F9B21D",           // review required / aging

        // Text
        "on-surface": "#e2e2e5",      // primary text
        "on-surface-var": "#c1c7d2",  // secondary labels

        // Borders / dividers
        "outline-variant": "#414751"
      },
      fontFamily: {
        headline: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      boxShadow: {
        panel: "0 40px 80px rgba(0, 0, 0, 0.35)",
        card: "0 8px 32px rgba(0, 0, 0, 0.24)",
        glow: "0 0 24px rgba(162, 201, 255, 0.12)"
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #a2c9ff 0%, #246cb3 100%)"
      },
      animation: {
        "fade-up": "fade-up 0.3s ease forwards",
        "slide-in": "slide-in 0.25s ease forwards"
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
