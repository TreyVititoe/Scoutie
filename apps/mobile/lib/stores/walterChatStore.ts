import type { TripPrefs } from "@walter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { safeStorage } from "./storage";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /* A trip Walter proposed alongside this reply; renders as an open card. */
  trip?: Partial<TripPrefs> | null;
};

type ChatState = {
  messages: ChatMessage[];
  add: (message: ChatMessage) => void;
  clear: () => void;
};

const MAX_KEPT = 60;

export const useWalterChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      add: (message) =>
        set((state) => ({
          messages: [...state.messages, message].slice(-MAX_KEPT),
        })),
      clear: () => set({ messages: [] }),
    }),
    {
      name: "walter_chat",
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      migrate: (persisted) => persisted as ChatState,
    }
  )
);
