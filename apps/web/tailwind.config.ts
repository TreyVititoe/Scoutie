import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-light": "oklch(0.34 0.005 250)",
        "gray-dark": "oklch(0.985 0.006 250)",
        "page-bg": "oklch(0.28 0.005 250)",
        "product-bg": "oklch(0.30 0.008 240)",
        accent: {
          DEFAULT: "oklch(0.65 0.135 263)",
          light: "oklch(0.72 0.11 261)",
        },
        "accent-dark": "oklch(0.54 0.16 263)",
        "accent-deep": "oklch(0.27 0.10 263)",
        cyan: "oklch(0.78 0.13 230)",
        "on-dark-secondary": "rgba(255,255,255,0.7)",
        "on-dark-tertiary": "rgba(255,255,255,0.4)",
        "on-light-secondary": "rgba(255,255,255,0.7)",
        "on-light-tertiary": "rgba(255,255,255,0.45)",
        "surface-dark": {
          1: "oklch(0.34 0.005 250)",
          2: "oklch(0.39 0.005 250)",
        },
        "surface-1": "oklch(0.34 0.005 250)",
        "surface-2": "oklch(0.39 0.005 250)",
        "surface-3": "oklch(0.44 0.005 250)",
        "tinted-pitch": "oklch(0.28 0.005 250)",
        "quiet-slate": "oklch(0.34 0.005 250)",
        "raised-slate": "oklch(0.39 0.005 250)",
        "hover-slate": "oklch(0.44 0.005 250)",
        "snow-off-glacier": "oklch(0.985 0.006 250)",
        "cornflower-beacon": "oklch(0.65 0.135 263)",
        "reykjavik-sky": "oklch(0.72 0.11 261)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "14px",
        pill: "980px",
      },
      boxShadow: {
        card: "3px 5px 30px 0px rgba(0, 0, 0, 0.22)",
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
