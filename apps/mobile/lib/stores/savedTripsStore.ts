import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TripCartItem } from "@walter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SavedTrip = {
  id: string;
  name: string;
  destination: string;
  items: TripCartItem[];
  totalCost: number;
  savedAt: string;
  startDate?: string;
  endDate?: string;
};

type SavedTripsState = {
  trips: SavedTrip[];
  save: (trip: SavedTrip) => void;
  remove: (id: string) => void;
};

export const useSavedTrips = create<SavedTripsState>()(
  persist(
    (set) => ({
      trips: [],
      save: (trip) =>
        set((state) => ({ trips: [trip, ...state.trips] })),
      remove: (id) =>
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
    }),
    {
      name: "walter_saved_trips",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
