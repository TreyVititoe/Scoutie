"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { mergePrefs, readStored } from "@/lib/prefs";
import { useSavedTripsStore } from "@/lib/stores/savedTripsStore";
import { useTripCartStore, type CartItem } from "@/lib/stores/tripCartStore";

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

type CartOp = {
  match: string;
  action: "mark_booked" | "unmark_booked" | "remove";
};

/* Walter sees the browser's trip state with every message. */
function buildChatContext() {
  const p = readStored<Record<string, unknown>>("walter_prefs", {});
  const prefs: Record<string, unknown> = {};
  for (const key of [
    "destination",
    "startDate",
    "endDate",
    "travelers",
    "budget",
    "vibes",
    "description",
    "departureCity",
    "departureAirportCode",
  ]) {
    const v = p[key];
    if (v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)) {
      prefs[key] = v;
    }
  }
  const cart = useTripCartStore.getState();
  const saved = useSavedTripsStore.getState().trips;
  return {
    prefs,
    cart: cart.items.map((i) => ({
      title: i.title,
      type: i.type,
      price: i.price,
      booked: cart.bookedIds.includes(i.id),
    })),
    savedTrips: saved.map((t) => ({
      name: t.name,
      destination: t.destination,
      when: t.startDate
        ? `${t.startDate}${t.endDate ? ` to ${t.endDate}` : ""}`
        : undefined,
    })),
  };
}

function shortDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* Plain-text version of a message: Walter's **bold** markers stripped. */
function plainText(text: string): string {
  return text.split("**").join("");
}

/* A pasteable summary of a proposed trip. */
function tripSummaryText(trip: NonNullable<ChatTrip>): string {
  const lines: string[] = [`Trip: ${trip.destination ?? "Trip"}`];
  if (trip.startDate && trip.endDate) {
    lines.push(`When: ${shortDate(trip.startDate)} to ${shortDate(trip.endDate)}`);
  }
  lines.push(
    `Who: ${(trip.travelers ?? 0) > 1 ? `${trip.travelers} travelers` : "Solo trip"}`
  );
  if (trip.departureCity || trip.departureAirportCode) {
    lines.push(
      `From: ${trip.departureCity ?? "Departure"}${trip.departureAirportCode ? ` (${trip.departureAirportCode})` : ""}`
    );
  }
  if ((trip.budget ?? 0) > 0) {
    lines.push(`Budget: $${trip.budget!.toLocaleString()} for the group`);
  }
  if (trip.vibes?.length) lines.push(`Vibes: ${trip.vibes.join(", ")}`);
  if (trip.description) lines.push(trip.description);
  return lines.join("\n");
}

/* Walter bolds key phrases with **double asterisks**. */
function Boldable({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; /* clipboard blocked (insecure context); leave the label alone */
    }
    setCopiedKey(key);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedKey(null), 1400);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy, open]);

  const openTrip = (trip: NonNullable<ChatTrip>) => {
    /* A stale chosen-trip from an earlier session would shadow these prefs
     * on /results (the Jamaica-opens-as-New-York bug). Clear it first. */
    try {
      localStorage.removeItem("walter_trip");
    } catch {}
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

  /* Apply Walter's actions to browser state; returns a trip to render as
   * an openable card when one makes sense. */
  const applyChatActions = (data: {
    trip?: ChatTrip;
    update?: ChatTrip;
    cartOps?: CartOp[] | null;
    openSaved?: string | null;
    cartItems?: CartItem[] | null;
    builtTrip?: ChatTrip;
  }): ChatTrip => {
    if (data.cartItems?.length) {
      /* Walter built the cart himself: load it and go straight there. */
      try {
        localStorage.removeItem("walter_trip");
      } catch {}
      if (data.builtTrip) {
        mergePrefs({
          destination: data.builtTrip.destination ?? "",
          startDate: data.builtTrip.startDate ?? "",
          endDate: data.builtTrip.endDate ?? "",
          travelers: data.builtTrip.travelers ?? 2,
          budget: data.builtTrip.budget ?? 0,
          vibes: data.builtTrip.vibes ?? [],
          description: data.builtTrip.description ?? "",
          departureCity: data.builtTrip.departureCity ?? "",
          departureAirportCode: data.builtTrip.departureAirportCode ?? "",
        });
      }
      useTripCartStore.setState({ items: data.cartItems, bookedIds: [] });
      setOpen(false);
      router.push("/trip");
      return null;
    }
    if (data.update) {
      try {
        localStorage.removeItem("walter_trip");
      } catch {}
      mergePrefs(data.update as Record<string, unknown>);
    }
    if (data.cartOps) {
      for (const op of data.cartOps) {
        const cart = useTripCartStore.getState();
        const item = cart.items.find((i) =>
          i.title.toLowerCase().includes(op.match.toLowerCase())
        );
        if (!item) continue;
        const booked = cart.bookedIds.includes(item.id);
        if (op.action === "remove") cart.removeItem(item.id);
        else if (op.action === "mark_booked" && !booked)
          cart.toggleBooked(item.id);
        else if (op.action === "unmark_booked" && booked)
          cart.toggleBooked(item.id);
      }
    }
    if (data.openSaved) {
      /* Best match wins: exact name, then name prefix, then loose includes.
       * The old both-ways includes() happily grabbed an ancient "New York"
       * trip; loose matches now also prefer trips that actually have items. */
      const wanted = data.openSaved.toLowerCase();
      const score = (t: { name: string; destination: string; items: unknown[] }) => {
        const name = t.name.toLowerCase();
        const dest = t.destination.toLowerCase();
        let s = 0;
        if (name === wanted) s = 40;
        else if (name.startsWith(wanted) || wanted.startsWith(name)) s = 30;
        else if (name.includes(wanted) || wanted.includes(name)) s = 20;
        else if (dest.includes(wanted) || wanted.includes(dest)) s = 10;
        if (s > 0 && t.items.length > 0) s += 5;
        return s;
      };
      type SavedTrip = ReturnType<
        typeof useSavedTripsStore.getState
      >["trips"][number];
      let trip: SavedTrip | null = null;
      let bestScore = 0;
      for (const t of useSavedTripsStore.getState().trips) {
        const s = score(t);
        if (s > bestScore) {
          trip = t;
          bestScore = s;
        }
      }
      if (trip) {
        try {
          localStorage.removeItem("walter_trip");
        } catch {}
        mergePrefs({
          destination: trip.destination,
          startDate: trip.startDate ?? "",
          endDate: trip.endDate ?? "",
          travelers: trip.travelers ?? 2,
        });
        setOpen(false);
        if (trip.items.length > 0) {
          /* A built-out trip: restore its cart and show it. */
          useTripCartStore.setState({ items: trip.items, bookedIds: [] });
          router.push("/trip");
        } else {
          /* Saved from prefs only: an empty /trip cart helps nobody.
           * Reopen the planner so the searches run again. */
          router.push("/results");
        }
      }
    }
    if (data.trip) return data.trip;
    if (data.update) {
      const p = readStored<Record<string, unknown>>("walter_prefs", {});
      return typeof p.destination === "string" && p.destination
        ? (p as ChatTrip)
        : null;
    }
    return null;
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setDraft("");
    setError(null);
    const next: Message[] = [
      ...messages,
      { id: `u-${++seqRef.current}`, role: "user", content },
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
          context: buildChatContext(),
        }),
      });
      const data = (await resp.json()) as {
        reply?: string;
        trip?: ChatTrip;
        update?: ChatTrip;
        cartOps?: CartOp[] | null;
        openSaved?: string | null;
        cartItems?: CartItem[] | null;
        builtTrip?: ChatTrip;
        error?: string;
      };
      if (!resp.ok || !data.reply) {
        throw new Error(data.error || "Walter stepped away for a moment.");
      }
      const cardTrip = applyChatActions(data);
      setMessages((cur) => [
        ...cur,
        {
          id: `a-${++seqRef.current}`,
          role: "assistant",
          content: data.reply as string,
          trip: cardTrip,
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
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <Image
              src="/walter-face.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full"
            />
            <div>
              <p className="text-[17px] font-semibold text-ink">Walter</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">
                Your travel concierge. Ask him anything.
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div>
                <div className="flex items-end gap-2">
                  <Image
                    src="/walter-face.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full"
                  />
                  <div className="max-w-[82%] rounded-2xl bg-[#E9E9EB] px-4 py-3 text-[14px] leading-relaxed text-ink">
                    <Boldable text="Where are we headed? Tell me a **place**, a **month**, or just a mood — I will take it from there." />
                  </div>
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
                  {m.role === "user" ? (
                    <div className="ml-auto max-w-[88%] rounded-2xl bg-accent px-4 py-3 text-[14px] leading-relaxed text-white">
                      <Boldable text={m.content} />
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <Image
                        src="/walter-face.png"
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 rounded-full"
                      />
                      <div className="max-w-[82%] rounded-2xl bg-[#E9E9EB] px-4 py-3 text-[14px] leading-relaxed text-ink">
                        <Boldable text={m.content} />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void copy(m.id, plainText(m.content))}
                    className={`mt-1 text-[11px] font-medium text-ink-faint transition hover:text-ink ${
                      m.role === "user" ? "ml-auto block text-right" : "ml-9"
                    }`}
                  >
                    {copiedKey === m.id ? "Copied" : "Copy"}
                  </button>
                  {m.trip?.destination ? (
                    <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_14px_36px_-14px_rgba(20,30,60,0.35)]">
                      <div className="relative h-32">
                        {/* eslint-disable-next-line @next/next/no-img-element -- /api/photo 302s to the provider; next/image can't follow it */}
                        <img
                          src={`/api/photo?query=${encodeURIComponent(m.trip.destination)}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,14,24,0.85)] via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 px-4 pb-2.5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">
                            Your trip is ready
                          </p>
                          <p className="truncate text-[19px] font-bold tracking-tight text-white">
                            {m.trip.destination}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 px-4 py-3 text-[12px]">
                        <p className="text-ink">
                          <span className="mr-2 font-semibold text-ink-soft">When</span>
                          <span className="font-medium">
                            {m.trip.startDate && m.trip.endDate
                              ? `${shortDate(m.trip.startDate)} to ${shortDate(m.trip.endDate)}`
                              : "Dates flexible"}
                          </span>
                        </p>
                        <p className="text-ink">
                          <span className="mr-2 font-semibold text-ink-soft">Who</span>
                          <span className="font-medium">
                            {(m.trip.travelers ?? 0) > 1
                              ? `${m.trip.travelers} travelers`
                              : "Solo trip"}
                          </span>
                        </p>
                        {m.trip.departureCity || m.trip.departureAirportCode ? (
                          <p className="text-ink">
                            <span className="mr-2 font-semibold text-ink-soft">From</span>
                            <span className="font-medium">
                              {m.trip.departureCity ?? "Departure"}
                              {m.trip.departureAirportCode
                                ? ` (${m.trip.departureAirportCode})`
                                : ""}
                            </span>
                          </p>
                        ) : null}
                        {(m.trip.budget ?? 0) > 0 ? (
                          <p className="text-ink">
                            <span className="mr-2 font-semibold text-ink-soft">Budget</span>
                            <span className="font-medium">
                              ${m.trip.budget!.toLocaleString()} for the group
                            </span>
                          </p>
                        ) : null}
                        {m.trip.vibes?.length ? (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {m.trip.vibes.slice(0, 4).map((v) => (
                              <span
                                key={v}
                                className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold capitalize text-ink"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="px-3 pb-3">
                        <button
                          type="button"
                          onClick={() => openTrip(m.trip!)}
                          className="block w-full rounded-full bg-accent py-2.5 text-center text-[13px] font-bold text-white transition hover:bg-accent-light"
                        >
                          Open live flights and stays
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void copy(`trip-${m.id}`, tripSummaryText(m.trip!))
                          }
                          className="mt-1.5 block w-full text-center text-[11px] font-medium text-ink-faint transition hover:text-ink"
                        >
                          {copiedKey === `trip-${m.id}`
                            ? "Trip details copied"
                            : "Copy trip details"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
            {busy ? (
              <div className="flex items-end gap-2">
                <Image
                  src="/walter-face.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-full"
                />
                <div className="inline-flex items-center gap-2 rounded-2xl bg-[#E9E9EB] px-4 py-2.5 text-[12px] text-ink-soft">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  Walter is thinking
                </div>
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
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#404042] text-white shadow-[0_16px_40px_-12px_rgba(20,30,60,0.5)] transition hover:scale-105"
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
          <Image
            src="/walter-face.png"
            alt=""
            width={56}
            height={56}
            className="h-full w-full rounded-full object-cover"
          />
        )}
      </button>
    </>
  );
}
