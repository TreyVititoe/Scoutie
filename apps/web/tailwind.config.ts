import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Daylight field — bright canvas, ink text, photography carries the color
        ink: {
          DEFAULT: "oklch(0.25 0.02 258)",
          soft: "oklch(0.25 0.02 258 / 0.72)",
          faint: "oklch(0.25 0.02 258 / 0.48)",
        },
        paper: "oklch(0.975 0.004 250)",
        card: "oklch(0.99 0.002 250)",
        line: "oklch(0.25 0.02 258 / 0.10)",
        // Legacy names, re-pointed bright so unswept files flip with the theme
        "gray-light": "oklch(0.99 0.002 250)",
        "gray-dark": "oklch(0.25 0.02 258)",
        "page-bg": "oklch(0.975 0.004 250)",
        "product-bg": "oklch(0.962 0.006 245)",
        accent: {
          DEFAULT: "oklch(0.65 0.135 263)",
          light: "oklch(0.72 0.11 261)",
          /* Opacity modifiers (accent/20) don't work on raw OKLCH strings;
           * tint is the pre-mixed band color for calendar ranges etc. */
          tint: "oklch(0.65 0.135 263 / 0.16)",
        },
        "accent-dark": "oklch(0.54 0.16 263)",
        "accent-deep": "oklch(0.27 0.10 263)",
        cyan: "oklch(0.78 0.13 230)",
        "on-dark-secondary": "rgba(255,255,255,0.7)",
        "on-dark-tertiary": "rgba(255,255,255,0.4)",
        "on-light-secondary": "oklch(0.25 0.02 258 / 0.72)",
        "on-light-tertiary": "oklch(0.25 0.02 258 / 0.48)",
        "surface-dark": {
          1: "oklch(0.34 0.005 250)",
          2: "oklch(0.39 0.005 250)",
        },
        "surface-1": "oklch(0.99 0.002 250)",
        "surface-2": "oklch(0.955 0.005 250)",
        "surface-3": "oklch(0.925 0.008 252)",
        // Tinted Pitch stays dark: it is the over-photo overlay and chip color
        "tinted-pitch": "oklch(0.28 0.005 250)",
        "quiet-slate": "oklch(0.99 0.002 250)",
        "raised-slate": "oklch(0.955 0.005 250)",
        "hover-slate": "oklch(0.925 0.008 252)",
        "snow-off-glacier": "oklch(0.985 0.006 250)",
        "cornflower-beacon": "oklch(0.65 0.135 263)",
        "reykjavik-sky": "oklch(0.72 0.11 261)",
      },
      fontFamily: {
        /* System stack: SF Pro on Apple devices, matching the native
         * app's typography exactly. */
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        /* DESIGN.md type ramp. Size-only tokens (no line-height baked in)
         * so swapping a literal for a token never shifts layout. */
        label: "13px",
        body: "15px",
        title: "17px",
      },
      borderRadius: {
        DEFAULT: "14px",
        pill: "980px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 30, 60, 0.05), 0 8px 24px rgba(20, 30, 60, 0.08)",
      },
      letterSpacing: {
        "display": "-0.3px",
        "section": "-0.2px",
        "body": "-0.4px",
        "caption": "-0.2px",
        "micro": "-0.1px",
      },
      lineHeight: {
        "display": "1.07",
        "section": "1.10",
        "page": "1.14",
        "card-title": "1.19",
      },
      maxWidth: {
        "content": "980px",
      },
    },
  },
  plugins: [],
};

export default config;
