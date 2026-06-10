// Mirror of the Tailwind tokens for places that can't use className (Stack
// options, native style props on third-party components, etc.).
export const colors = {
  pageBg: "rgb(64, 64, 68)",
  productBg: "rgb(72, 72, 80)",
  surface1: "rgb(82, 82, 86)",
  surface2: "rgb(94, 94, 98)",
  surface3: "rgb(108, 108, 112)",
  text: "rgb(248, 248, 250)",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textTertiary: "rgba(255, 255, 255, 0.4)",
  accent: "rgb(91, 141, 239)",
  accentDark: "rgb(58, 99, 196)",
  cyan: "rgb(102, 213, 241)",
  hairline: "rgba(255, 255, 255, 0.10)",
  hairlineStrong: "rgba(255, 255, 255, 0.18)",
} as const;
