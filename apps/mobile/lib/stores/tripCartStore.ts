import type { TripCartItem } from "@walter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { safeStorage } from "./storage";

type CartState = {
  items: TripCartItem[];
  /* ids the traveler has marked booked on the checkout checklist */
  bookedIds: string[];
  add: (item: TripCartItem) => void;
  remove: (id: string) => void;
  toggleBooked: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

export const useTripCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      bookedIds: [],
      add: (item) =>
        set((state) =>
          state.items.find((i) => i.id === item.id)
            ? state
            : { items: [...state.items, item] }
        ),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          bookedIds: state.bookedIds.filter((b) => b !== id),
        })),
      toggleBooked: (id) =>
        set((state) => ({
          bookedIds: state.bookedIds.includes(id)
            ? state.bookedIds.filter((b) => b !== id)
            : [...state.bookedIds, id],
        })),
      clear: () => set({ items: [], bookedIds: [] }),
      has: (id) => !!get().items.find((i) => i.id === id),
    }),
    {
      name: "walter_cart",
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      /* v0 → v1 changed nothing structural; stored shape passes through. */
      migrate: (persisted) => persisted as CartState,
    }
  )
);

export function selectTotalPrice(state: CartState) {
  return state.items.reduce((sum, i) => sum + (i.price ?? 0), 0);
}

export function selectByType(
  state: CartState,
  type: TripCartItem["type"]
): TripCartItem[] {
  return state.items.filter((i) => i.type === type);
}
