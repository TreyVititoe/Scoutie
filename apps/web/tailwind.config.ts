import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#006571",
          dim: "#005862",
          container: "#79e7f8",
        },
        "on-primary": "#d7f9ff",
        "on-primary-container": "#00535d",
        secondary: {
          DEFAULT: "#266658",
          container: "#afefdd",
        },
        "on-secondary-container": "#195c4e",
        tertiary: {
          DEFAULT: "#005cab",
          container: "#7eb2ff",
        },
        background: "#f5f7f8",
        surface: {
          DEFAULT: "#f5f7f8",
          "container-lowest": "#ffffff",
          "container-low": "#eef1f2",
          container: "#e5e9ea",
          "container-high": "#dfe3e4",
        },
        "on-surface": "#2c2f30",
        "on-surface-variant": "#595c5d",
        "on-background": "#2c2f30",
        outline: {
          DEFAULT: "#747778",
          variant: "#abadae",
        },
        error: {
          DEFAULT: "#b31b25",
          container: "#fb5151",
        },
      },
      fontFamily: {
        headline: ["var(--font-headline)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Manrope", "sans-serif"],
        label: ["var(--font-body)", "Manrope", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
