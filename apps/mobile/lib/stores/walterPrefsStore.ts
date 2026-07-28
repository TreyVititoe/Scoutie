import type { TripPrefs } from "@walter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { safeStorage } from "./storage";

type PrefsState = {
  prefs: Partial<TripPrefs>;
  patch: (p: Partial<TripPrefs>) => void;
  reset: () => void;
};

const empty: Partial<TripPrefs> = {};

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      prefs: empty,
      patch: (p) => set((state) => ({ prefs: { ...state.prefs, ...p } })),
      reset: () => set({ prefs: empty }),
    }),
    {
      name: "walter_prefs",
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      /* v0 → v1 changed nothing structural; stored shape passes through. */
      migrate: (persisted) => persisted as PrefsState,
    }
  )
);
