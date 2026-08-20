import Anthropic from "@anthropic-ai/sdk";

import type { TripPrefs } from "@walter/shared";

import { buildTripCart, type BuiltCartItem } from "./tripBuilder";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WALTER_CHAT_SYSTEM = `You are Walter, a seasoned travel concierge. You speak as Walter — a person-like presence in a travel app called Walter — never as a product feature.

WHO WALTER IS:
- A worldly, warm, direct travel expert. Decades of trips worth of knowledge: destinations, neighborhoods, seasons, weather windows, flight logistics, hotels versus rentals, restaurants and what to order, events, packing, visas, tipping customs.
- Confident with opinions. When asked for the best trattoria in Florence or whether October beats May in Lisbon, give a real answer with named places, not a survey.
- Concise. Two to five sentences for most replies. No bullet lists unless the user asks for a list. Never use emoji.
- Ask at most ONE question per message. Never stack two or more questions in a single reply — ask the most important one, wait for the answer, then ask the next. Two or three short question turns beat one long interrogation.
- Bold the words the user must not miss using **double asterisks**: the question itself, destinations, dates, prices, and anything they need to confirm. Example: "Do you want to fly out on **Friday the 12th** or **Saturday the 13th**?"
- Walter does not volunteer details about how he works. If someone directly asks whether he is an AI, he says the planning brains behind the app are AI and moves the conversation back to travel; he never claims to be human.

WHAT WALTER CAN DO IN THE APP:
- The app builds real trips: live flights, hotels, events, and curated activities, gathered into one cart the traveler books through each provider's own site.
- A TRAVELER CONTEXT block may follow this prompt with their current trip plan, their cart (each item flagged booked or not), and their saved trips. That is your working memory: answer questions about it directly ("what do I have saved?", "what's left to book?") and act on it with your tools. Reference items by name naturally.
- NEW TRIP: when the conversation produces a concrete, plannable trip, call propose_trip with your best structured version. Fill in sensible specifics for anything unstated rather than interrogating; one short clarifying question is fine when the trip is genuinely ambiguous.
- MULTI-CITY TRIPS: most real trips visit more than one place. When the traveler wants several stops (Rome then Florence, an island hop, a coast drive), fill the legs array with 2 to 5 ordered stops and give each its stay window; still set destination/startDate/endDate to the first leg and the overall window. Suggest a sensible split when they name places without nights.
- BUILD THE WHOLE CART: ONLY when the traveler explicitly asks you to add the items yourself ("build it for me", "add it all to my cart", "put the whole thing together", "book it up"), call build_trip_cart. The app then runs the real searches, adds your picks (a flight, a stay, a couple of events) to their cart, and opens it. If they merely described a trip without asking you to fill the cart, use propose_trip instead and let them add items themselves. Never call build_trip_cart unprompted.
- CHANGE THE CURRENT TRIP: when they want to shift dates, add travelers, change destination or budget on the trip already in progress, call update_trip with ONLY the changed fields, and confirm what changed in your reply.
- MANAGE THEIR CART: when they booked something, want something dropped, or ask to un-mark an item, call manage_cart with one operation per item, matching by the item's name.
- REOPEN A SAVED TRIP: when they mention a past or saved trip, call open_saved_trip with its name so the app loads it.
- Always accompany a tool call with a short reply in Walter's voice saying what you did.
- If the user mentions preferences the trip search cannot filter (a specific airline like Delta, a hotel brand, seat class), acknowledge it, fold it into the description field, and tell them where they will see those options (the Flights or Stay tab) once the trip opens.
- Walter cannot complete purchases himself. Booking happens on the provider's site; the app tracks what is booked. Never claim a payment was made.

FACTS AND HONESTY:
- Recommend only real places that exist. If unsure something is still open, say so.
- You do not have live prices or availability in chat; the app fetches live data when the trip opens. Speak in typical ranges, not fake exact quotes.`;

const tripFields = {
  destination: {
    type: "string",
    description: "City and country/state, e.g. 'Barcelona, Spain'",
  },
  startDate: { type: "string", description: "YYYY-MM-DD" },
  endDate: { type: "string", description: "YYYY-MM-DD" },
  travelers: { type: "integer", description: "Number of adults" },
  budget: {
    type: "integer",
    description: "Total trip budget in USD for the whole group, 0 if unknown",
  },
  departureCity: { type: "string", description: "Where they leave from" },
  departureAirportCode: {
    type: "string",
    description: "IATA code for the departure airport",
  },
  vibes: {
    type: "array",
    items: { type: "string" },
    description: "Trip interests, e.g. food, culture, nightlife, outdoors",
  },
  description: {
    type: "string",
    description:
      "Free-text preferences that matter to this traveler, including airline or hotel-brand preferences",
  },
  legs: {
    type: "array",
    description:
      "Multi-city trips only: 2 to 5 ordered stops, each with its own stay window. Consecutive legs should share a boundary date (Rome ends the day Florence starts). Omit for single-city trips.",
    items: {
      type: "object",
      properties: {
        destination: {
          type: "string",
          description: "City and country/state for this stop",
        },
        startDate: { type: "string", description: "YYYY-MM-DD arrival" },
        endDate: { type: "string", description: "YYYY-MM-DD departure" },
      },
      required: ["destination"],
    },
  },
} as const;

const proposeTripTool: Anthropic.Tool = {
  name: "propose_trip",
  description:
    "Assemble a NEW trip discussed in this conversation so the app can open it as a real, bookable plan. The app uses these fields to run live flight, hotel, event, and activity searches.",
  input_schema: {
    type: "object",
    properties: { ...tripFields },
    required: ["destination", "startDate", "endDate", "travelers"],
  },
};

const buildTripCartTool: Anthropic.Tool = {
  name: "build_trip_cart",
  description:
    "Run the live flight, stay, and event searches for a trip and add Walter's picks straight to the traveler's cart. ONLY for an explicit ask ('build it for me', 'add it all'); propose_trip covers everything else.",
  input_schema: {
    type: "object",
    properties: { ...tripFields },
    required: ["destination", "startDate", "endDate", "travelers"],
  },
};

const updateTripTool: Anthropic.Tool = {
  name: "update_trip",
  description:
    "Change fields on the trip currently in progress (the CURRENT TRIP PLAN in the traveler context). Send ONLY the fields that change; everything else is preserved. The app re-runs searches with the merged plan.",
  input_schema: {
    type: "object",
    properties: { ...tripFields },
    required: [],
  },
};

const manageCartTool: Anthropic.Tool = {
  name: "manage_cart",
  description:
    "Operate on items in the traveler's cart (listed in the traveler context). Use when they say they booked something, want an item removed, or want a booked mark undone. Match items by name.",
  input_schema: {
    type: "object",
    properties: {
      operations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            match: {
              type: "string",
              description:
                "Part of the cart item's title, enough to identify it uniquely",
            },
            action: {
              type: "string",
              enum: ["mark_booked", "unmark_booked", "remove"],
            },
          },
          required: ["match", "action"],
        },
      },
    },
    required: ["operations"],
  },
};

const openSavedTripTool: Anthropic.Tool = {
  name: "open_saved_trip",
  description:
    "Load one of the traveler's saved trips (listed in the traveler context) back into the planner.",
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The saved trip's name as it appears in the context",
      },
    },
    required: ["name"],
  },
};

export type WalterChatTurn = { role: "user" | "assistant"; content: string };

export type WalterCartOp = {
  match: string;
  action: "mark_booked" | "unmark_booked" | "remove";
};

export type WalterChatContext = {
  prefs?: Record<string, unknown>;
  cart?: { title: string; type?: string; price?: number; booked?: boolean }[];
  savedTrips?: { name: string; destination?: string; when?: string }[];
};

export type WalterChatResult = {
  reply: string;
  trip: Partial<TripPrefs> | null;
  update: Partial<TripPrefs> | null;
  cartOps: WalterCartOp[] | null;
  openSaved: string | null;
  /* Set when Walter built the cart himself (explicit ask only). */
  cartItems: BuiltCartItem[] | null;
  builtTrip: Partial<TripPrefs> | null;
};

function contextBlock(context: WalterChatContext | undefined, today: string) {
  const lines: string[] = [`Today's date is ${today}. Proposed trips must start after this date.`];
  if (context?.prefs && Object.keys(context.prefs).length) {
    lines.push(`\nTRAVELER CONTEXT — CURRENT TRIP PLAN:\n${JSON.stringify(context.prefs)}`);
  }
  if (context?.cart?.length) {
    lines.push(
      `\nTRAVELER CONTEXT — CART (${context.cart.length} items):\n` +
        context.cart
          .map(
            (i) =>
              `- ${i.title}${i.type ? ` [${i.type}]` : ""}${
                typeof i.price === "number" ? ` $${i.price}` : ""
              } — ${i.booked ? "BOOKED" : "not booked yet"}`
          )
          .join("\n")
    );
  }
  if (context?.savedTrips?.length) {
    lines.push(
      `\nTRAVELER CONTEXT — SAVED TRIPS:\n` +
        context.savedTrips
          .map(
            (t) =>
              `- "${t.name}"${t.destination ? ` (${t.destination}` : ""}${
                t.when ? `, ${t.when})` : t.destination ? ")" : ""
              }`
          )
          .join("\n")
    );
  }
  return lines.join("\n");
}

/* One API call per chat message: Walter replies in text and may attach one
 * or more actions via tools. Tool calls end the turn — the client applies
 * them locally (the trip state lives on the device, not our servers). */
export async function walterChat(
  turns: WalterChatTurn[],
  context?: WalterChatContext
): Promise<WalterChatResult> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: [
      { type: "text", text: WALTER_CHAT_SYSTEM },
      { type: "text", text: contextBlock(context, today) },
    ],
    tools: [
      proposeTripTool,
      buildTripCartTool,
      updateTripTool,
      manageCartTool,
      openSavedTripTool,
    ],
    messages: turns,
  });

  const result: WalterChatResult = {
    reply: "",
    trip: null,
    update: null,
    cartOps: null,
    openSaved: null,
    cartItems: null,
    builtTrip: null,
  };

  let buildBlock: { id: string; trip: Partial<TripPrefs> } | null = null;

  for (const block of response.content) {
    if (block.type === "text") {
      result.reply += block.text;
    } else if (block.type === "tool_use") {
      const input = block.input as Record<string, unknown>;
      if (block.name === "propose_trip") {
        result.trip = cleanTrip(input, true);
      } else if (block.name === "build_trip_cart") {
        const trip = cleanTrip(input, true);
        if (trip) buildBlock = { id: block.id, trip };
      } else if (block.name === "update_trip") {
        result.update = cleanTrip(input, false);
      } else if (block.name === "manage_cart") {
        result.cartOps = cleanCartOps(input);
      } else if (block.name === "open_saved_trip" && typeof input.name === "string") {
        result.openSaved = input.name.trim().slice(0, 120) || null;
      }
    }
  }

  if (buildBlock) {
    /* Run the real searches, then hand the outcome back so Walter narrates
     * what he actually picked instead of a canned line. */
    const cart = await buildTripCart(buildBlock.trip);
    const outcome = cart.items.length
      ? `Cart built and the app is opening it now. ${cart.notes.join(". ")}. Estimated total: $${cart.total.toLocaleString()}. In one or two sentences, tell the traveler what you picked and that everything books through each provider. No question needed.`
      : "Every search came back empty; nothing was added to the cart. Briefly say so and suggest opening the trip planner to search by hand.";
    try {
      const followup = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: [
          { type: "text", text: WALTER_CHAT_SYSTEM },
          { type: "text", text: contextBlock(context, today) },
        ],
        tools: [
          proposeTripTool,
          buildTripCartTool,
          updateTripTool,
          manageCartTool,
          openSavedTripTool,
        ],
        messages: [
          ...turns,
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: buildBlock.id,
                content: outcome,
              },
            ],
          },
        ],
      });
      const text = followup.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      if (text) result.reply = text;
    } catch {
      /* The cart still ships; only the narration falls back. */
    }
    if (cart.items.length) {
      result.cartItems = cart.items;
      result.builtTrip = buildBlock.trip;
      result.trip = null;
      if (!result.reply.trim()) {
        result.reply = `Done — your ${buildBlock.trip.destination} trip is in the cart: ${cart.notes.join(". ")}.`;
      }
    } else if (!result.reply.trim()) {
      result.reply =
        "The live searches came up empty just now, so nothing went into your cart. Open the planner and I will keep helping from there.";
    }
  }

  if (!result.reply.trim()) {
    result.reply = result.trip
      ? "Your trip is ready — open it to see live flights, places to stay, and things to do."
      : result.update
        ? "Done — I updated your trip."
        : result.cartOps?.length
          ? "Done — your trip checklist is updated."
          : result.openSaved
            ? "Pulling that trip back up for you."
            : "Tell me a little more about where you are dreaming of going.";
  }

  return { ...result, reply: result.reply.trim() };
}

function cleanCartOps(input: Record<string, unknown>): WalterCartOp[] | null {
  if (!Array.isArray(input.operations)) return null;
  const ops: WalterCartOp[] = [];
  for (const raw of input.operations.slice(0, 12)) {
    if (!raw || typeof raw !== "object") continue;
    const { match, action } = raw as { match?: unknown; action?: unknown };
    if (typeof match !== "string" || !match.trim()) continue;
    if (
      action !== "mark_booked" &&
      action !== "unmark_booked" &&
      action !== "remove"
    )
      continue;
    ops.push({ match: match.trim().slice(0, 120), action });
  }
  return ops.length ? ops : null;
}

function cleanTrip(
  input: Record<string, unknown>,
  requireDestination: boolean
): Partial<TripPrefs> | null {
  const destination =
    typeof input.destination === "string" ? input.destination.trim() : "";
  if (requireDestination && !destination) return null;

  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const trip: Partial<TripPrefs> = {};
  if (destination) trip.destination = destination;

  const startDate =
    typeof input.startDate === "string" && iso.test(input.startDate)
      ? input.startDate
      : undefined;
  const endDate =
    typeof input.endDate === "string" && iso.test(input.endDate)
      ? input.endDate
      : undefined;
  if (startDate) trip.startDate = startDate;
  if (endDate && (!startDate || endDate > startDate)) trip.endDate = endDate;

  const travelers = Number(input.travelers);
  if (Number.isFinite(travelers) && travelers >= 1 && travelers <= 16) {
    trip.travelers = Math.round(travelers);
  } else if (requireDestination) {
    trip.travelers = 2;
  }

  const budget = Number(input.budget);
  if (Number.isFinite(budget) && budget > 0 && budget <= 1_000_000) {
    trip.budget = Math.round(budget);
  }

  if (typeof input.departureCity === "string" && input.departureCity.trim()) {
    trip.departureCity = input.departureCity.trim();
  }
  if (
    typeof input.departureAirportCode === "string" &&
    /^[A-Za-z]{3}$/.test(input.departureAirportCode.trim())
  ) {
    trip.departureAirportCode = input.departureAirportCode.trim().toUpperCase();
  }
  if (Array.isArray(input.vibes)) {
    const vibes = input.vibes
      .filter((v): v is string => typeof v === "string" && !!v.trim())
      .slice(0, 6);
    if (vibes.length) trip.vibes = vibes;
  }
  if (typeof input.description === "string" && input.description.trim()) {
    trip.description = input.description.trim().slice(0, 500);
  }

  if (Array.isArray(input.legs)) {
    const legs = input.legs
      .slice(0, 5)
      .map((raw) => {
        if (!raw || typeof raw !== "object") return null;
        const { destination: d, startDate: s, endDate: e } = raw as Record<string, unknown>;
        if (typeof d !== "string" || !d.trim()) return null;
        return {
          destination: d.trim().slice(0, 120),
          startDate: typeof s === "string" && iso.test(s) ? s : undefined,
          endDate: typeof e === "string" && iso.test(e) ? e : undefined,
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
    if (legs.length >= 2) {
      trip.legs = legs;
      /* The first leg is the trip single-city code sees. */
      trip.destination = legs[0].destination;
      if (legs[0].startDate) trip.startDate = legs[0].startDate;
      const lastEnd = legs[legs.length - 1].endDate;
      if (lastEnd && trip.startDate && lastEnd > trip.startDate) {
        trip.endDate = lastEnd;
      }
    }
  }

  return Object.keys(trip).length ? trip : null;
}
