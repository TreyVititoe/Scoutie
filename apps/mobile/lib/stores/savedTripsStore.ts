import type { TripCartItem } from "@walter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { safeStorage } from "./storage";

export type SavedTrip = {
  id: string;
  name: string;
  destination: string;
  items: TripCartItem[];
  totalCost: number;
  savedAt: string;
  startDate?: string;
  endDate?: string;
  /* Checkout progress travels with the trip, so reopening resumes it. */
  bookedIds?: string[];
  /* Set when the save came from a curated-card heart; reopening resumes
   * planning (clarify) instead of loading an empty cart. */
  curatedId?: string;
  durationDays?: number;
};

type SavedTripsState = {
  trips: SavedTrip[];
  save: (trip: SavedTrip) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
};

export const useSavedTrips = create<SavedTripsState>()(
  persist(
    (set, get) => ({
      trips: [],
      /* Same id re-saves in place — no duplicates from repeated taps. */
      save: (trip) =>
        set((state) => ({
          trips: [trip, ...state.trips.filter((t) => t.id !== trip.id)],
        })),
      remove: (id) =>
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
      has: (id) => get().trips.some((t) => t.id === id),
    }),
    {
      name: "walter_saved_trips",
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      /* v0 → v1 added optional fields only; stored shape passes through. */
      migrate: (persisted) => persisted as SavedTripsState,
    }
  )
);
