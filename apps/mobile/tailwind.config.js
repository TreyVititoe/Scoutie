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
      borderRadius: {
        DEFAULT: 14,
        pill: 980,
      },
    },
  },
  plugins: [],
};
