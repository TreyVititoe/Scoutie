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
        "gray-dark": "#0B1437",
        "page-bg": "#EEF4FF",
        accent: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
        },
        "accent-dark": "#1E40AF",
        "accent-deep": "#0B1437",
        cyan: "#38BDF8",
        "on-dark-secondary": "rgba(255,255,255,0.7)",
        "on-dark-tertiary": "rgba(255,255,255,0.4)",
        "on-light-secondary": "rgba(0,0,0,0.55)",
        "on-light-tertiary": "rgba(0,0,0,0.35)",
        "surface-dark": {
          1: "#0E1B3D",
          2: "#142046",
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
