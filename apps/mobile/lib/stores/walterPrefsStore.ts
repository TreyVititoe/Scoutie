import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TripPrefs } from "@walter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
