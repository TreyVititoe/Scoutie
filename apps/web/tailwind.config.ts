import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-light": "#f5f5f7",
        "gray-dark": "#1d1d1f",
        "page-bg": "#f0f4f5",
        accent: {
          DEFAULT: "#C25538",
          light: "#D67A5C",
        },
        "accent-dark": "#6F2613",
        "accent-deep": "#321008",
        cyan: "#FFE0A8",
        "on-dark-secondary": "rgba(255,255,255,0.7)",
        "on-dark-tertiary": "rgba(255,255,255,0.4)",
        "on-light-secondary": "rgba(0,0,0,0.55)",
        "on-light-tertiary": "rgba(0,0,0,0.35)",
        "surface-dark": {
          1: "#272729",
          2: "#2a2a2d",
        },
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
