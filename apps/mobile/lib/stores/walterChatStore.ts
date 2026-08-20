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

export type ChatThread = {
  id: string;
  messages: ChatMessage[];
};

type ChatState = {
  threads: ChatThread[];
  activeId: string;
  add: (message: ChatMessage) => void;
  newThread: () => void;
  setActive: (id: string) => void;
  clear: () => void;
};

const MAX_THREADS = 8;
const MAX_KEPT = 60;

const firstThread: ChatThread = { id: "t-1", messages: [] };

export const useWalterChat = create<ChatState>()(
  persist(
    (set) => ({
      threads: [firstThread],
      activeId: firstThread.id,
      add: (message) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === state.activeId
              ? { ...t, messages: [...t.messages, message].slice(-MAX_KEPT) }
              : t
          ),
        })),
      newThread: () =>
        set((state) => {
          /* Reuse an existing empty thread instead of stacking blanks. */
          const empty = state.threads.find((t) => t.messages.length === 0);
          if (empty) return { activeId: empty.id };
          const thread: ChatThread = { id: `t-${Date.now()}`, messages: [] };
          return {
            threads: [...state.threads, thread].slice(-MAX_THREADS),
            activeId: thread.id,
          };
        }),
      setActive: (id) =>
        set((state) => ({
          activeId: state.threads.some((t) => t.id === id)
            ? id
            : state.activeId,
        })),
      clear: () =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === state.activeId ? { ...t, messages: [] } : t
          ),
        })),
    }),
    {
      name: "walter_chat",
      storage: createJSONStorage(() => safeStorage),
      version: 2,
      migrate: (persisted) => {
        const old = persisted as {
          messages?: ChatMessage[];
          threads?: ChatThread[];
          activeId?: string;
        };
        if (old?.threads?.length) return old as ChatState;
        /* v1 kept a single flat message list. */
        const messages = Array.isArray(old?.messages) ? old.messages : [];
        return {
          threads: [{ id: "t-1", messages }],
          activeId: "t-1",
        } as ChatState;
      },
    }
  )
);

export function activeMessages(state: ChatState): ChatMessage[] {
  return (
    state.threads.find((t) => t.id === state.activeId)?.messages ?? []
  );
}

/** Short label for a thread tab: the proposed destination's initials,
 *  else its position number. */
export function threadLabel(thread: ChatThread, index: number): string {
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    const dest = thread.messages[i].trip?.destination;
    if (dest) {
      const word = dest.split(",")[0].trim();
      return word.slice(0, 2).toUpperCase();
    }
  }
  return `${index + 1}`;
}
