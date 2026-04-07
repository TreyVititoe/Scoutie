import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItemType =
  | "flight"
  | "hotel"
  | "event"
  | "activity"
  | "restaurant"
  | "site";

export type CartItem = {
  id: string;
  type: CartItemType;
  title: string;
  subtitle: string;
  price: number | null;
  image: string | null;
  bookingUrl: string | null;
  provider: string | null;
  date: string | null;
  meta: Record<string, unknown>;
};

export interface TripCartState {
  items: CartItem[];
}

export interface TripCartActions {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  isInCart: (id: string) => boolean;
  clearCart: () => void;
}

export const useTripCartStore = create<TripCartState & TripCartActions>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      isInCart: (id) => get().items.some((i) => i.id === id),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "walter_cart",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // SSR fallback — no-op storage
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);

// Computed selectors
export const selectTotalPrice = (state: TripCartState) =>
  state.items.reduce((sum, item) => sum + (item.price ?? 0), 0);

export const selectItemCount = (state: TripCartState) => state.items.length;

export const selectItemsByType = (state: TripCartState) => {
  const grouped: Partial<Record<CartItemType, CartItem[]>> = {};
  for (const item of state.items) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type]!.push(item);
  }
  return grouped;
};
