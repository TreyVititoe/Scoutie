import { create } from "zustand";
import type { CartItem } from "./tripCartStore";

export type SavedTrip = {
  id: string;
  name: string;
  destination: string;
  totalCost: number;
  items: CartItem[];
  createdAt: string;
  /* The search window this trip was built for. Optional because trips saved
   * before this existed will not have it. Without it, reloading a saved trip
   * left /results with no dates and nothing to search. */
  startDate?: string;
  endDate?: string;
  travelers?: number;
};

export interface SavedTripsState {
  trips: SavedTrip[];
}

export interface SavedTripsActions {
  saveTrip: (
    name: string,
    destination: string,
    items: CartItem[],
    window?: { startDate?: string; endDate?: string; travelers?: number }
  ) => string;
  deleteTrip: (id: string) => void;
  renameTrip: (id: string, name: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 12);
}

export const useSavedTripsStore = create<SavedTripsState & SavedTripsActions>()(
  (set, get) => ({
    trips: [],

    saveTrip: (name, destination, items, window) => {
      /* Replace a same-named trip rather than stacking duplicates: two
       * entries called "Tokyo" tell the traveler nothing about which is which. */
      const existing = get().trips.find(
        (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (existing) {
        set((state) => ({ trips: state.trips.filter((t) => t.id !== existing.id) }));
      }
      const id = generateId();
      const totalCost = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
      const trip: SavedTrip = {
        id,
        name,
        destination,
        totalCost,
        items,
        createdAt: new Date().toISOString(),
        ...(window?.startDate ? { startDate: window.startDate } : {}),
        ...(window?.endDate ? { endDate: window.endDate } : {}),
        ...(window?.travelers ? { travelers: window.travelers } : {}),
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
