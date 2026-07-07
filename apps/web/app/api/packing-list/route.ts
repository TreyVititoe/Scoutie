import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  rateLimit,
  cleanString,
  cleanStringArray,
  clampInt,
  isReasonableDate,
} from "@/lib/apiGuard";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type PackingRequest = {
  destination: string;
  startDate: string;
  endDate: string;
  activities: string[];
  pace: string;
  travelers: number;
};

const PACKING_SYSTEM_PROMPT = `You are a practical travel packing assistant. Given trip details, generate a categorized packing list.

RULES:
- Be realistic and specific to the destination, season, and activities
- Consider the weather and climate for the destination during the travel dates
- Mark truly essential items (passport, medications, chargers) as essential
- Adjust quantities based on trip length and number of travelers
- Keep item names concise (2-4 words max)
- Do not include emojis anywhere in the response

RESPONSE FORMAT -- raw JSON only, no markdown, no code fences:
{
  "categories": [
    {
      "name": "Clothing",
      "items": [
        { "name": "T-shirts", "quantity": 5, "essential": false }
      ]
    }
  ]
}

Categories must be exactly these six, in this order:
1. Clothing
2. Toiletries
3. Electronics
4. Documents
5. Accessories
6. Activity-Specific

Keep each category to 5-10 items. Be practical, not exhaustive.`;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "packing", limit: 15 });
  if (limited) return limited;

  try {
    const raw = (await req.json()) as PackingRequest;
    const destination = cleanString(raw?.destination, 80) ?? "";
    const { startDate, endDate } = raw ?? {};
    const activities = cleanStringArray(raw?.activities, 15, 60);
    const pace = cleanString(raw?.pace, 30) ?? "moderate";
    const travelers = clampInt(raw?.travelers, 1, 10, 1);

    if (!destination || !isReasonableDate(startDate) || !isReasonableDate(endDate)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const nights = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const userPrompt = `Generate a packing list for this trip:

DESTINATION: ${destination}
DATES: ${startDate} to ${endDate} (${nights} nights)
TRAVELERS: ${travelers}
ACTIVITIES: ${activities.join(", ") || "general sightseeing"}
PACE: ${pace || "moderate"}

Generate the categorized packing list as JSON.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: PACKING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    const cleaned = text
      .replace(/```(?:json)?\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      parsed = JSON.parse(jsonMatch[0]);
    }

    return Response.json(parsed);
  } catch (err) {
    console.error("[/api/packing-list]", err);
    return Response.json(
      { error: "Failed to generate packing list. Please try again." },
      { status: 500 }
    );
  }
}
