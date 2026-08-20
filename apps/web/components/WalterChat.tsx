"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { mergePrefs } from "@/lib/prefs";

type ChatTrip = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: number;
  vibes?: string[];
  description?: string;
  departureCity?: string;
  departureAirportCode?: string;
} | null;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  trip?: ChatTrip;
};

const OPENERS = [
  "Plan me a beach week in March",
  "Where should I eat in Rome?",
  "Best month for Tokyo?",
];

function shortDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* Floating Walter concierge: a launcher bubble that opens a chat panel.
 * Mirrors the mobile Chat tab against the same /api/chat endpoint. */
export function WalterChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy, open]);

  const openTrip = (trip: NonNullable<ChatTrip>) => {
    mergePrefs({
      destination: trip.destination ?? "",
      startDate: trip.startDate ?? "",
      endDate: trip.endDate ?? "",
      travelers: trip.travelers ?? 2,
      budget: trip.budget ?? 0,
      vibes: trip.vibes ?? [],
      description: trip.description ?? "",
      departureCity: trip.departureCity ?? "",
      departureAirportCode: trip.departureAirportCode ?? "",
    });
    setOpen(false);
    router.push("/results");
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setDraft("");
    setError(null);
    const next: Message[] = [
      ...messages,
      { id: `u-${Date.now()}`, role: "user", content },
    ];
    setMessages(next);
    setBusy(true);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await resp.json()) as {
        reply?: string;
        trip?: ChatTrip;
        error?: string;
      };
      if (!resp.ok || !data.reply) {
        throw new Error(data.error || "Walter stepped away for a moment.");
      }
      setMessages((cur) => [
        ...cur,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply as string,
          trip: data.trip ?? null,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Walter stepped away for a moment."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(600px,calc(100dvh-8rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_64px_-16px_rgba(20,30,60,0.35)]">
          <div className="border-b border-line px-5 py-4">
            <p className="text-[17px] font-semibold text-ink">Walter</p>
            <p className="mt-0.5 text-[12px] text-ink-soft">
              Your travel concierge. Ask him anything.
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div>
                <div className="max-w-[88%] rounded-2xl border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed text-ink">
                  Where are we headed? Tell me a place, a month, or just a
                  mood — I will take it from there.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPENERS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => send(o)}
                      className="rounded-full border border-line bg-paper px-3.5 py-2 text-[12px] font-medium text-ink transition hover:bg-surface-2"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="mb-3">
                  <div
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[88%] rounded-2xl bg-accent px-4 py-3 text-[14px] leading-relaxed text-white"
                        : "max-w-[88%] rounded-2xl border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed text-ink"
                    }
                  >
                    {m.content}
                  </div>
                  {m.trip?.destination ? (
                    <div className="mt-2 max-w-[88%] overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                          Trip ready
                        </p>
                        <p className="mt-0.5 truncate text-[16px] font-bold text-ink">
                          {m.trip.destination}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-soft">
                          {m.trip.startDate && m.trip.endDate
                            ? `${shortDate(m.trip.startDate)} to ${shortDate(m.trip.endDate)}`
                            : "Dates flexible"}
                          {" · "}
                          {(m.trip.travelers ?? 0) > 1
                            ? `${m.trip.travelers} travelers`
                            : "Solo"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openTrip(m.trip!)}
                        className="block w-full bg-accent py-2.5 text-center text-[13px] font-semibold text-white transition hover:bg-accent-light"
                      >
                        Open this trip
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
            {busy ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-2.5 text-[12px] text-ink-soft">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                Walter is thinking
              </div>
            ) : null}
            {error ? (
              <p className="mt-2 text-[12px] text-red-700">{error}</p>
            ) : null}
          </div>

          <form
            className="flex items-end gap-2 border-t border-line px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message Walter"
              aria-label="Message Walter"
              className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-accent"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat with Walter" : "Chat with Walter"}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#404042] text-white shadow-[0_16px_40px_-12px_rgba(20,30,60,0.5)] transition hover:scale-105"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M12 3C6.99 3 3 6.58 3 11c0 2.2 1.02 4.19 2.68 5.64-.15 1.05-.6 2.14-1.51 3.04a.5.5 0 0 0 .33.86c1.9.09 3.49-.5 4.66-1.24.9.26 1.86.4 2.84.4 5.01 0 9-3.58 9-8s-3.99-8-9-8Z" />
          </svg>
        )}
      </button>
    </>
  );
}
