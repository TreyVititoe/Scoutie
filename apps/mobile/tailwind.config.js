/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Bright "daylight field" system, mirroring apps/web.
        paper: "#F7F8FA",
        card: "#FCFCFE",
        ink: {
          DEFAULT: "#232B3F",
          soft: "rgba(35, 43, 63, 0.72)",
          faint: "rgba(35, 43, 63, 0.48)",
        },
        line: {
          DEFAULT: "rgba(35, 43, 63, 0.10)",
          strong: "rgba(35, 43, 63, 0.18)",
        },
        well: "#EFF1F5",
        lift: "#E6E9F0",
        accent: {
          DEFAULT: "#5B8DEF",
          light: "#7FA6F3",
        },
        "accent-dark": "#3D6FE0",
        cyan: "#66D5F1",
        // Legacy aliases (kept so existing class names resolve to the
        // bright system).
        "page-bg": "#F7F8FA",
        "product-bg": "#FCFCFE",
        "surface-1": "#FCFCFE",
        "surface-2": "#EFF1F5",
        "surface-3": "#E6E9F0",
      },
      borderRadius: {
        DEFAULT: 14,
        pill: 980,
      },
    },
  },
  plugins: [],
};
