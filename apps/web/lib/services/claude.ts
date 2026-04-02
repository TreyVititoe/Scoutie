import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCOUTIE_SYSTEM_PROMPT = `You are Scoutie, an expert AI travel planner. You create detailed, bookable trip itineraries that maximize value for the traveler's budget and preferences.

RULES:
- Every recommendation must be a REAL place, flight, or experience that actually exists
- Include specific names, addresses, and approximate prices in USD
- Structure the trip day-by-day with morning, afternoon, and evening blocks
- Factor in realistic travel times between locations
- Account for jet lag on arrival days
- Include a mix of popular highlights and hidden local gems
- Always include at least one free activity per day (parks, walks, viewpoints)
- Respect the budget strictly — never exceed it
- Consider seasonality and weather for the travel dates
- Include practical tips (what to wear, local customs, tipping, safety)

RESPONSE FORMAT:
Return a JSON object matching this schema EXACTLY. No markdown, no explanation, raw JSON only:
{
  "trips": [
    {
      "tier": "budget" | "balanced" | "premium",
      "title": "string — catchy trip title",
      "summary": "string — 2-3 sentence overview",
      "destination": "string",
      "totalEstimatedCost": number,
      "days": [
        {
          "dayNumber": 1,
          "title": "string — day theme",
          "summary": "string — brief overview",
          "estimatedCost": number,
          "items": [
            {
              "itemType": "flight" | "hotel" | "rental" | "activity" | "restaurant" | "event" | "transport" | "note",
              "title": "string — specific name",
              "description": "string — details, tips",
              "startTime": "HH:MM" | null,
              "endTime": "HH:MM" | null,
              "durationMinutes": number | null,
              "estimatedCost": number,
              "locationName": "string",
              "locationLat": number | null,
              "locationLng": number | null,
              "rating": number | null,
              "imageSearchQuery": "string — what to search for a photo",
              "bookingSearchQuery": "string — what to search to book this"
            }
          ]
        }
      ]
    }
  ]
}

Generate EXACTLY 3 trip variants: budget, balanced, and premium.`;

/**
 * Generate full trip itineraries from quiz data.
 */
export async function generateTrips(quizData: {
  planningMode?: string;
  destinations?: string[];
  surpriseMe?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  flexibleDates?: boolean;
  tripDurationDays?: number | null;
  travelersCount?: number;
  travelerType?: string | null;
  childrenCount?: number;
  childrenAges?: number[];
  budgetMode?: string;
  budgetAmount?: number | null;
  departureCity?: string;
  flightClass?: string;
  flightPriority?: string;
  accommodationTypes?: string[];
  accommodationMustHaves?: string[];
  locationPreference?: string;
  activityInterests?: string[];
  pace?: string | null;
  diningPreference?: string | null;
  dietaryRestrictions?: string[];
  // Legacy fields
  destination?: string;
  travelers?: number;
  budget?: number;
  vibes?: string[];
}) {
  const destination =
    quizData.destinations?.join(", ") || quizData.destination || "Surprise me";
  const budget = quizData.budgetAmount || quizData.budget || 2000;
  const travelers = quizData.travelersCount || quizData.travelers || 1;
  const interests =
    quizData.activityInterests?.join(", ") || quizData.vibes?.join(", ") || "general sightseeing";

  const nights =
    quizData.startDate && quizData.endDate
      ? Math.round(
          (new Date(quizData.endDate).getTime() -
            new Date(quizData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : quizData.tripDurationDays || 7;

  const userPrompt = `Plan a trip with these details:

DESTINATION: ${destination}${quizData.surpriseMe ? " (pick the best destination for my interests and budget)" : ""}
DATES: ${quizData.startDate || "flexible"} to ${quizData.endDate || "flexible"} (${nights} nights)
DEPARTING FROM: ${quizData.departureCity || "Not specified"}
TRAVELERS: ${travelers} ${quizData.travelerType || "travelers"}${quizData.childrenCount ? ` + ${quizData.childrenCount} children (ages: ${quizData.childrenAges?.join(", ")})` : ""}
BUDGET: $${budget.toLocaleString()} ${quizData.budgetMode === "per_day" ? "per day" : "total"}
FLIGHT CLASS: ${quizData.flightClass || "economy"}
FLIGHT PRIORITY: ${quizData.flightPriority || "best value"}
ACCOMMODATION: ${quizData.accommodationTypes?.join(", ") || "hotel"}
ACCOMMODATION MUST-HAVES: ${quizData.accommodationMustHaves?.join(", ") || "none specified"}
LOCATION PREFERENCE: ${quizData.locationPreference || "city center"}
INTERESTS: ${interests}
PACE: ${quizData.pace || "moderate"}
DINING: ${quizData.diningPreference || "mixed"}
DIETARY: ${quizData.dietaryRestrictions?.join(", ") || "none"}

Generate 3 complete trip itineraries (budget, balanced, premium) as JSON.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: SCOUTIE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Failed to parse trip generation response");
  }
}

/**
 * Expand user vibes/interests into specific event keywords
 * for better Ticketmaster results.
 */
export async function expandInterests(vibes: string[]): Promise<string[]> {
  if (vibes.length === 0) return [];

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `A traveler has these interests: ${vibes.join(", ")}.

List 6-10 specific event or entertainment keywords that would match what they'd enjoy — things like concert genres, sports, performance types, or festival styles. Focus on what would appear as Ticketmaster event names or categories.

Reply with ONLY a JSON array of strings, no explanation. Example: ["jazz", "comedy show", "art exhibition"]`,
      },
    ],
  });

  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as string[];
  } catch {
    return [];
  }
}

/**
 * Generate a personalized AI summary of the trip results.
 */
export async function generateTripSummary(params: {
  destination: string;
  vibes: string[];
  budget: number;
  travelers: number;
  travelersType: string;
  eventCount: number;
  topEvents: string[];
}): Promise<string> {
  const { destination, vibes, budget, travelers, travelersType, eventCount, topEvents } = params;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Write a short, friendly 2-sentence trip summary for a traveler. Plain prose only — no markdown, no headers, no bullet points.

Details:
- Destination: ${destination}
- Vibe: ${vibes.join(", ")}
- Budget: $${budget}
- Party: ${travelers} ${travelersType}
- Events found: ${eventCount}
- Top picks: ${topEvents.slice(0, 3).join(", ")}

Be specific and warm. Mention the destination. No emojis. No markdown formatting whatsoever.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return text.trim();
}
