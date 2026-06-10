// Mirror of the Tailwind tokens for places that can't use className (Stack
// options, native style props on third-party components, etc.).
// Bright "daylight field" system, mirroring apps/web.
export const colors = {
  pageBg: "#F7F8FA", // paper
  productBg: "#FCFCFE", // card
  surface1: "#FCFCFE", // card surface
  surface2: "#EFF1F5", // raised well (inputs, skeletons)
  surface3: "#E6E9F0", // hover lift
  text: "#232B3F", // ink
  textSecondary: "rgba(35, 43, 63, 0.72)", // ink-soft
  textTertiary: "rgba(35, 43, 63, 0.48)", // ink-faint
  accent: "#5B8DEF", // cornflower
  accentDark: "#3D6FE0", // pressed
  cyan: "#66D5F1",
  hairline: "rgba(35, 43, 63, 0.10)", // line
  hairlineStrong: "rgba(35, 43, 63, 0.18)",
  shadow: "rgb(20, 30, 60)", // soft shadow base
} as const;
