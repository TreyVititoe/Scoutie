import Anthropic from "@anthropic-ai/sdk";

import type { TripPrefs } from "@walter/shared";

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
- When the conversation produces a concrete, plannable trip — a destination plus at least a rough sense of when or how long — call the propose_trip tool with your best structured version of it. Fill in sensible specifics for anything unstated (dates a few weeks out, 2 travelers, hotel stay) rather than interrogating the user. One short clarifying question is fine when the trip is genuinely ambiguous; otherwise propose.
- Always accompany a propose_trip call with a short text reply that sells the trip in Walter's voice and tells the user the plan is ready to open.
- If the user mentions preferences the trip search cannot filter (a specific airline like Delta, a hotel brand, seat class), acknowledge it, fold it into the description field, and tell them where they will see those options (the Flights or Stay tab) once the trip opens.
- Walter cannot complete purchases himself. Booking happens on the provider's site; the app tracks what is booked. Never claim a payment was made.

FACTS AND HONESTY:
- Recommend only real places that exist. If unsure something is still open, say so.
- You do not have live prices or availability in chat; the app fetches live data when the trip opens. Speak in typical ranges, not fake exact quotes.`;

const proposeTripTool: Anthropic.Tool = {
  name: "propose_trip",
  description:
    "Assemble the trip discussed in this conversation so the app can open it as a real, bookable plan. Call this whenever a concrete destination emerges. The app uses these fields to run live flight, hotel, event, and activity searches.",
  input_schema: {
    type: "object",
    properties: {
      destination: {
        type: "string",
        description: "City and country/state, e.g. 'Barcelona, Spain'",
      },
      startDate: { type: "string", description: "YYYY-MM-DD" },
      endDate: { type: "string", description: "YYYY-MM-DD" },
      travelers: { type: "integer", description: "Number of adults, default 2" },
      budget: {
        type: "integer",
        description: "Total trip budget in USD for the whole group, 0 if unknown",
      },
      departureCity: {
        type: "string",
        description: "Where they leave from, empty string if unknown",
      },
      departureAirportCode: {
        type: "string",
        description: "IATA code for the departure airport, empty string if unknown",
      },
      vibes: {
        type: "array",
        items: { type: "string" },
        description: "Trip interests, e.g. food, culture, nightlife, outdoors",
      },
      description: {
        type: "string",
        description:
          "Free-text preferences that matter to this traveler, including airline or hotel-brand preferences, e.g. 'prefers Delta flights'",
      },
    },
    required: [
      "destination",
      "startDate",
      "endDate",
      "travelers",
      "budget",
      "departureCity",
      "departureAirportCode",
      "vibes",
      "description",
    ],
    additionalProperties: false,
  },
};

export type WalterChatTurn = { role: "user" | "assistant"; content: string };

export type WalterChatResult = {
  reply: string;
  trip: Partial<TripPrefs> | null;
};

/* One API call per chat message: Walter replies in text and, when the
 * conversation has produced a plannable trip, attaches a structured trip
 * via the propose_trip tool. The tool call ends the turn — the client
 * renders it as an "Open this trip" card, so no tool_result round trip. */
export async function walterChat(
  turns: WalterChatTurn[]
): Promise<WalterChatResult> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: [
      { type: "text", text: WALTER_CHAT_SYSTEM },
      {
        type: "text",
        text: `Today's date is ${today}. Proposed trips must start after this date.`,
      },
    ],
    tools: [proposeTripTool],
    messages: turns,
  });

  let reply = "";
  let trip: Partial<TripPrefs> | null = null;

  for (const block of response.content) {
    if (block.type === "text") {
      reply += block.text;
    } else if (block.type === "tool_use" && block.name === "propose_trip") {
      trip = cleanTrip(block.input as Record<string, unknown>);
    }
  }

  if (!reply.trim()) {
    reply = trip
      ? "Your trip is ready — open it to see live flights, places to stay, and things to do."
      : "Tell me a little more about where you are dreaming of going.";
  }

  return { reply: reply.trim(), trip };
}

function cleanTrip(input: Record<string, unknown>): Partial<TripPrefs> | null {
  const destination =
    typeof input.destination === "string" ? input.destination.trim() : "";
  if (!destination) return null;

  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const startDate =
    typeof input.startDate === "string" && iso.test(input.startDate)
      ? input.startDate
      : undefined;
  const endDate =
    typeof input.endDate === "string" && iso.test(input.endDate)
      ? input.endDate
      : undefined;

  const trip: Partial<TripPrefs> = { destination };
  if (startDate) trip.startDate = startDate;
  if (endDate && startDate && endDate > startDate) trip.endDate = endDate;

  const travelers = Number(input.travelers);
  trip.travelers =
    Number.isFinite(travelers) && travelers >= 1 && travelers <= 16
      ? Math.round(travelers)
      : 2;

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

  return trip;
}
