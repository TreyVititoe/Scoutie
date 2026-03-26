"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TripPreferences, TripPlan, SavedTrip, Interest, AccommodationType, BudgetRange, TripPace } from "@/types";

interface QuizState {
  step: number;
  preferences: TripPreferences;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDestination: (destination: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setBudget: (budget: BudgetRange) => void;
  setTravelers: (travelers: number) => void;
  toggleInterest: (interest: Interest) => void;
  setAccommodation: (accommodation: AccommodationType) => void;
  setPace: (pace: TripPace) => void;
  reset: () => void;
}

interface TripState {
  currentPlan: TripPlan | null;
  savedTrips: SavedTrip[];
  isLoading: boolean;
  setCurrentPlan: (plan: TripPlan | null) => void;
  saveTrip: (name: string) => void;
  removeSavedTrip: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

const defaultPreferences: TripPreferences = {
  destination: "",
  startDate: "",
  endDate: "",
  budget: "moderate",
  travelers: 1,
  interests: [],
  accommodation: "any",
  pace: "moderate",
};

export const useQuizStore = create<QuizState>()((set) => ({
  step: 0,
  preferences: { ...defaultPreferences },
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  setDestination: (destination) =>
    set((s) => ({ preferences: { ...s.preferences, destination } })),
  setDates: (startDate, endDate) =>
    set((s) => ({ preferences: { ...s.preferences, startDate, endDate } })),
  setBudget: (budget) =>
    set((s) => ({ preferences: { ...s.preferences, budget } })),
  setTravelers: (travelers) =>
    set((s) => ({ preferences: { ...s.preferences, travelers } })),
  toggleInterest: (interest) =>
    set((s) => {
      const interests = s.preferences.interests.includes(interest)
        ? s.preferences.interests.filter((i) => i !== interest)
        : [...s.preferences.interests, interest];
      return { preferences: { ...s.preferences, interests } };
    }),
  setAccommodation: (accommodation) =>
    set((s) => ({ preferences: { ...s.preferences, accommodation } })),
  setPace: (pace) =>
    set((s) => ({ preferences: { ...s.preferences, pace } })),
  reset: () => set({ step: 0, preferences: { ...defaultPreferences } }),
}));

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      savedTrips: [],
      isLoading: false,
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      saveTrip: (name) => {
        const { currentPlan, savedTrips } = get();
        if (!currentPlan) return;
        const saved: SavedTrip = {
          id: crypto.randomUUID(),
          plan: currentPlan,
          preferences: useQuizStore.getState().preferences,
          createdAt: new Date().toISOString(),
          name,
        };
        set({ savedTrips: [...savedTrips, saved] });
      },
      removeSavedTrip: (id) =>
        set((s) => ({ savedTrips: s.savedTrips.filter((t) => t.id !== id) })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: "scoutie-trips" }
  )
);
