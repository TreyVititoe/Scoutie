import { NextRequest, NextResponse } from "next/server";

import { rateLimit, readJsonCapped } from "@/lib/apiGuard";
import {
  walterChat,
  type WalterChatContext,
  type WalterChatTurn,
} from "@/lib/services/walterChat";

export const maxDuration = 60;

const MAX_TURNS = 24;
const MAX_TURN_CHARS = 2000;

/* The client sends its local trip state so Walter can see and act on it.
 * Clamp everything: it feeds the model, not the database. */
function cleanContext(raw: unknown): WalterChatContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const src = raw as {
    prefs?: unknown;
    cart?: unknown;
    savedTrips?: unknown;
  };
  const out: WalterChatContext = {};

  if (src.prefs && typeof src.prefs === "object" && !Array.isArray(src.prefs)) {
    const prefs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(src.prefs as Record<string, unknown>)) {
      if (prefs && Object.keys(prefs).length >= 16) break;
      if (typeof v === "string") prefs[k] = v.slice(0, 300);
      else if (typeof v === "number" || typeof v === "boolean") prefs[k] = v;
      else if (k === "legs" && Array.isArray(v)) {
        /* Multi-city stops: small objects, clamped per field. */
        const legs = v
          .slice(0, 5)
          .map((leg) => {
            if (!leg || typeof leg !== "object") return null;
            const { destination, startDate, endDate } = leg as Record<string, unknown>;
            if (typeof destination !== "string" || !destination.trim()) return null;
            return {
              destination: destination.slice(0, 120),
              startDate: typeof startDate === "string" ? startDate.slice(0, 10) : undefined,
              endDate: typeof endDate === "string" ? endDate.slice(0, 10) : undefined,
            };
          })
          .filter(Boolean);
        if (legs.length) prefs[k] = legs;
      } else if (Array.isArray(v))
        prefs[k] = v
          .filter((x): x is string => typeof x === "string")
          .slice(0, 8)
          .map((x) => x.slice(0, 60));
    }
    if (Object.keys(prefs).length) out.prefs = prefs;
  }

  if (Array.isArray(src.cart)) {
    const cart = [];
    for (const item of src.cart.slice(0, 24)) {
      if (!item || typeof item !== "object") continue;
      const { title, type, price, booked } = item as Record<string, unknown>;
      if (typeof title !== "string" || !title.trim()) continue;
      cart.push({
        title: title.trim().slice(0, 120),
        type: typeof type === "string" ? type.slice(0, 20) : undefined,
        price: typeof price === "number" && Number.isFinite(price) ? price : undefined,
        booked: booked === true,
      });
    }
    if (cart.length) out.cart = cart;
  }

  if (Array.isArray(src.savedTrips)) {
    const saved = [];
    for (const t of src.savedTrips.slice(0, 16)) {
      if (!t || typeof t !== "object") continue;
      const { name, destination, when } = t as Record<string, unknown>;
      if (typeof name !== "string" || !name.trim()) continue;
      saved.push({
        name: name.trim().slice(0, 80),
        destination:
          typeof destination === "string" ? destination.slice(0, 80) : undefined,
        when: typeof when === "string" ? when.slice(0, 60) : undefined,
      });
    }
    if (saved.length) out.savedTrips = saved;
  }

  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { name: "chat", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const parsed = await readJsonCapped(req, 64 * 1024);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  const raw = Array.isArray((parsed.body as { messages?: unknown })?.messages)
    ? ((parsed.body as { messages: unknown[] }).messages as unknown[])
    : null;
  if (!raw || raw.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const turns: WalterChatTurn[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    if (!item || typeof item !== "object") continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    turns.push({ role, content: content.trim().slice(0, MAX_TURN_CHARS) });
  }
  if (!turns.length || turns[turns.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "last message must be from the user" },
      { status: 400 }
    );
  }
  /* The API requires the first message to be a user turn; trimming to
   * MAX_TURNS can leave an assistant turn first. */
  while (turns.length && turns[0].role !== "user") turns.shift();

  const context = cleanContext(
    (parsed.body as { context?: unknown })?.context
  );

  try {
    const result = await walterChat(turns, context);
    return NextResponse.json(result);
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Walter stepped away for a moment. Try again." },
      { status: 502 }
    );
  }
}
