import { NextRequest, NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";

/**
 * POST /api/checkout
 *
 * The simulated Walter booking agent.
 *
 * ── SIMULATION BOUNDARY ──────────────────────────────────────────────
 * This route fakes a booking orchestrator. In production, this is where
 * the real machinery plugs in:
 *   - flights    -> Duffel (create order, hold fare, issue tickets)
 *   - hotels     -> hotel booking APIs (Booking.com / Expedia Rapid)
 *   - events     -> ticketing partner APIs
 *   - payment    -> Stripe PaymentIntent, captured after all holds clear
 * Each item would be booked, confirmed, and rolled back on partial
 * failure. Here we validate the payload, mint realistic confirmation
 * codes, and return the booking shape the UI expects.
 * ─────────────────────────────────────────────────────────────────────
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Crockford-ish alphabet: no 0/O, no 1/I, so codes read cleanly off a phone */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function confirmationCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) {
    code += CODE_ALPHABET[b % CODE_ALPHABET.length];
  }
  return `WLT-${code}`;
}

type IncomingItem = Record<string, unknown> & { price?: number | null };

export async function POST(req: NextRequest) {
  let payload: { items?: IncomingItem[]; traveler?: { name?: unknown; email?: unknown } };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { items, traveler } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Nothing to book" }, { status: 400 });
  }

  const name = typeof traveler?.name === "string" ? traveler.name.trim() : "";
  const email = typeof traveler?.email === "string" ? traveler.email.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Traveler name is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid traveler email is required" }, { status: 400 });
  }

  // In a real orchestrator each of these would be an external booking call.
  const bookedItems = items.map((item) => ({
    ...item,
    confirmationCode: confirmationCode(),
  }));

  const total = items.reduce(
    (sum, item) => sum + (typeof item.price === "number" ? item.price : 0),
    0
  );

  return NextResponse.json({
    id: randomUUID(),
    bookedAt: new Date().toISOString(),
    traveler: { name, email },
    items: bookedItems,
    total,
  });
}
