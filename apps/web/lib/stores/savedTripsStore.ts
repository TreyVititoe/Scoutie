import { create } from "zustand";
import type { CartItem } from "./tripCartStore";

export type SavedTrip = {
  id: string;
  name: string;
  destination: string;
  totalCost: number;
  items: CartItem[];
  createdAt: string;
};

export interface SavedTripsState {
  trips: SavedTrip[];
}

export interface SavedTripsActions {
  saveTrip: (name: string, destination: string, items: CartItem[]) => string;
  deleteTrip: (id: string) => void;
  renameTrip: (id: string, name: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 12);
}

export const useSavedTripsStore = create<SavedTripsState & SavedTripsActions>()(
  (set, get) => ({
    trips: [],

    saveTrip: (name, destination, items) => {
      const id = generateId();
      const totalCost = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
      const trip: SavedTrip = {
        id,
        name,
        destination,
        totalCost,
        items,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ trips: [trip, ...state.trips] }));
      return id;
    },

    deleteTrip: (id) =>
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== id),
      })),

    renameTrip: (id, name) =>
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? { ...t, name } : t)),
      })),
  })
);

// Hydrate from localStorage
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("walter_saved_trips");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.trips) useSavedTripsStore.setState({ trips: parsed.trips });
    }
  } catch {}

  useSavedTripsStore.subscribe((state) => {
    localStorage.setItem("walter_saved_trips", JSON.stringify({ trips: state.trips }));
  });
}
