import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WALTER_SYSTEM_PROMPT = `You are Walter, an expert AI travel planner. You create detailed, bookable trip itineraries.

RULES:
- Every recommendation must be a REAL place that actually exists
- Include specific names and approximate prices in USD
- Structure each day with morning, afternoon, and evening blocks
- Factor in realistic travel times between locations
- Include a mix of popular highlights and hidden gems
- Always include at least one free activity per day
- Respect the budget strictly
- Consider seasonality for the travel dates

CRITICAL OUTPUT RULES:
- Descriptions MUST be under 10 words each
- Max 3 items per day
- No null fields — omit optional fields instead
- Raw JSON only — no markdown, no code fences, no explanation

RESPONSE FORMAT:
{"trips":[{"tier":"budget","title":"...","summary":"...","destination":"...","totalEstimatedCost":0,"days":[{"dayNumber":1,"title":"...","items":[{"itemType":"activity","title":"...","description":"...","startTime":"09:00","estimatedCost":0,"locationName":"..."}]}]}]}

Generate EXACTLY 3 trips: budget, balanced, premium.`;

type QuizData = {
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
  noAccommodation?: boolean;
  budgetSkipped?: boolean;
  activityInterests?: string[];
  destination?: string;
  destinationHint?: string;
  travelers?: number;
  budget?: number;
  vibes?: string[];
};

function buildUserPrompt(quizData: QuizData): string {
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

  // Accommodation line
  let accommodationLine: string;
  if (quizData.noAccommodation) {
    accommodationLine = "ACCOMMODATION: NOT NEEDED — traveler is staying with friends/family. Do NOT include any hotel or accommodation in the itinerary.";
  } else {
    const types = quizData.accommodationTypes?.join(", ") || "hotel";
    const mustHaves = quizData.accommodationMustHaves?.length
      ? `\nACCOMMODATION MUST-HAVES: ${quizData.accommodationMustHaves.join(", ")}`
      : "";
    const locPref = quizData.locationPreference
      ? `\nLOCATION PREFERENCE: ${quizData.locationPreference}`
      : "";
    accommodationLine = `ACCOMMODATION: ONLY use ${types}. Do NOT suggest hotels if the user asked for vacation rentals, and vice versa.${mustHaves}${locPref}`;
  }

  // Budget line
  const budgetLine = quizData.budgetSkipped
    ? "BUDGET: Flexible — suggest a range of price points"
    : `BUDGET: $${budget.toLocaleString()} ${quizData.budgetMode === "per_day" ? "per day" : "total"}`;

  return `Plan a trip with these details:

DESTINATION: ${destination}${quizData.surpriseMe ? " (pick the best destination for my interests and budget)" : ""}
DATES: ${quizData.startDate || "flexible"} to ${quizData.endDate || "flexible"} (${nights} nights)
DEPARTING FROM: ${quizData.departureCity || "Not specified"}
TRAVELERS: ${travelers} ${quizData.travelerType || "travelers"}${quizData.childrenCount ? ` + ${quizData.childrenCount} children (ages: ${quizData.childrenAges?.join(", ")})` : ""}
${budgetLine}
FLIGHT CLASS: ${quizData.flightClass || "economy"}
FLIGHT PRIORITY: ${quizData.flightPriority || "best value"}
${accommodationLine}
INTERESTS: ${interests}

Generate 3 complete trip itineraries (budget, balanced, premium) as JSON.`;
}

function parseClaudeJson(text: string) {
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return JSON.parse(jsonMatch[0]);
  }
}

/**
 * Stream trip generation — sends raw text chunks to keep Vercel alive,
 * then the client reassembles and parses the JSON.
 */
export async function generateTripsStream(quizData: QuizData): Promise<ReadableStream> {
  const userPrompt = buildUserPrompt(quizData);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8192,
          system: WALTER_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        });

        let fullText = "";
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            // Send each chunk to keep the connection alive
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Verify the JSON is valid before closing
        parseClaudeJson(fullText);
        controller.close();
      } catch (err) {
        console.error("[claude stream]", err);
        // If we haven't sent anything yet, send an error JSON
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ error: "Trip generation failed. Please try again." })
          )
        );
        controller.close();
      }
    },
  });
}

/**
 * Generate full trip itineraries from quiz data (non-streaming fallback).
 */
export async function generateTrips(quizData: QuizData) {
  const userPrompt = buildUserPrompt(quizData);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 16384,
    system: WALTER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    throw new Error("Response truncated — try a shorter trip duration");
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseClaudeJson(text);
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
 * Generate curated activity/restaurant/site suggestions for a destination.
 */
export type SuggestionsInput = {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  travelers: number;
  travelerType: string;
};

const SUGGESTIONS_SYSTEM_PROMPT = `You are Walter, a travel curator. Generate ONLY the absolute best, most unmissable recommendations for a destination. Quality over quantity. Each suggestion must be a real, specific place.

Return raw JSON only, no markdown:
{"suggestions": [
  {
    "type": "activity" | "restaurant" | "site",
    "title": "Specific real name",
    "description": "One compelling sentence, under 15 words",
    "estimatedCost": number (per person, USD),
    "locationName": "Neighborhood or area",
    "bestTime": "morning" | "afternoon" | "evening" | "anytime",
    "bookingSearchQuery": "what to Google to book this"
  }
]}

Return 8-10 suggestions max. Mix of activities (3-4), restaurants (2-3), and sites (2-3).`;

export async function generateSuggestions(input: SuggestionsInput) {
  const { destination, startDate, endDate, interests, travelers, travelerType } = input;

  const userPrompt = `Curate the best suggestions for this trip:

DESTINATION: ${destination}
DATES: ${startDate} to ${endDate}
TRAVELERS: ${travelers} ${travelerType}
INTERESTS: ${interests.join(", ") || "general sightseeing"}

Give me 8-10 top picks — the absolute must-dos. Mix of activities, restaurants, and sites/landmarks.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: SUGGESTIONS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    throw new Error("Response truncated");
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseClaudeJson(text);
}

/**
 * Generate compare-ready trip options for multiple destinations.
 * Returns one "balanced" trip per destination with key comparison metrics.
 */
const COMPARE_SYSTEM_PROMPT = `You are Walter, an expert AI travel planner. Generate trip options for comparison.

RULES:
- Every recommendation must be a REAL place
- Include specific names and approximate prices in USD
- Structure each day with morning, afternoon, and evening blocks
- Factor in realistic travel times
- Mix popular highlights and hidden gems
- Respect the budget strictly
- Consider seasonality

CRITICAL OUTPUT RULES:
- Descriptions MUST be under 10 words each
- Max 3 items per day
- No null fields — omit optional fields instead
- Raw JSON only — no markdown, no code fences, no explanation

RESPONSE FORMAT:
{"trips":[{"destination":"City, Country","title":"...","summary":"One compelling sentence about why this trip","totalEstimatedCost":0,"flightEstimate":0,"hotelEstimatePerNight":0,"topEvents":["Event 1","Event 2","Event 3"],"highlights":["Highlight 1","Highlight 2","Highlight 3"],"bestTimeToVisit":"...","days":[{"dayNumber":1,"title":"...","items":[{"itemType":"activity","title":"...","description":"...","startTime":"09:00","estimatedCost":0,"locationName":"..."}]}]}]}`;

export async function generateCompareTrips(quizData: QuizData) {
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
      : quizData.tripDurationDays || 5;

  const destinations = quizData.destinations?.length
    ? quizData.destinations
    : [];
  const isSurprise = quizData.surpriseMe || destinations.length === 0;

  const departureCity = quizData.departureCity || "";
  const travelerType = quizData.travelerType || "travelers";
  const accommodationTypes = quizData.accommodationTypes?.join(", ") || "hotel";

  const hint = quizData.destinationHint || "";

  let destinationLine: string;
  if (isSurprise) {
    destinationLine = `You MUST pick 3 specific destinations that are a PERFECT match for this traveler. Do NOT pick random cities.
${hint ? `\nIMPORTANT PREFERENCE: The traveler specifically wants destinations like "${hint}". This could be a specific city, country, region, or vibe (like "tropical" or "European"). ALL 3 destinations must strongly relate to this preference. If it's a city, include that city and suggest 2 similar alternatives. If it's a vibe like "tropical", pick 3 tropical destinations. If it's a country, pick 3 cities in or near that country.\n` : ""}
THINK ABOUT WHO THIS PERSON IS:
- They are ${travelers} ${travelerType} with a budget of $${budget.toLocaleString()} for ${nights} nights
- They love: ${interests}
- They are departing from: ${departureCity || "unknown (pick destinations reachable from major US hubs)"}
- They prefer: ${accommodationTypes}
${quizData.childrenCount ? `- They have ${quizData.childrenCount} children (ages: ${quizData.childrenAges?.join(", ")})` : ""}

DESTINATION SELECTION RULES:
1. Each destination must genuinely match their interests. If they love food and nightlife, suggest cities famous for food and nightlife -- not random beach towns.
2. Each destination must be realistic for their budget. Don't suggest Tokyo on a $1,000 budget.
3. Each destination must be reachable from ${departureCity || "a major US city"} within their budget.
4. Make the 3 options meaningfully different: one domestic/nearby, one mid-range, one aspirational (but still within budget).
5. Consider seasonality -- what's great to visit during their travel dates.
6. If they're a family with kids, pick family-friendly destinations. If they're friends looking for nightlife, pick cities with nightlife.

Do NOT pick generic tourist traps unless they genuinely match the interests. Be specific and thoughtful.`;
  } else if (destinations.length === 1) {
    destinationLine = `Generate 3 trip options for ${destinations[0]} at different times or with different themes.`;
  } else {
    destinationLine = `Generate one trip option for each: ${destinations.join(", ")}`;
  }

  const userPrompt = `Generate trip options for comparison:

${destinationLine}

DATES: ${quizData.startDate || "flexible"} to ${quizData.endDate || "flexible"} (${nights} nights)
DEPARTING FROM: ${departureCity || "Not specified"}
TRAVELERS: ${travelers} ${travelerType}${quizData.childrenCount ? ` + ${quizData.childrenCount} children` : ""}
BUDGET: $${budget.toLocaleString()} ${quizData.budgetMode === "per_day" ? "per day" : "total"}
FLIGHT CLASS: ${quizData.flightClass || "economy"}
ACCOMMODATION: ${accommodationTypes}
INTERESTS: ${interests}

Generate ${isSurprise || destinations.length <= 1 ? "3" : destinations.length} complete trip itineraries as JSON. Each trip should have a different destination${destinations.length === 1 ? " theme or time period" : ""}. Include estimated flight cost and hotel cost per night for comparison. The summary should explain WHY this destination is perfect for this specific traveler.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 16384,
    system: COMPARE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "max_tokens") {
    throw new Error("Response truncated — try fewer destinations or shorter trips");
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseClaudeJson(text);
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
