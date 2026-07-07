import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      /* The codebase uses setMounted(true)-style hydration guards in
       * effects throughout; refactoring them to useSyncExternalStore is
       * tracked work, not a lint emergency. */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
