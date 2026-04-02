import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { message, trip, quizData } = await req.json();

    if (!message || !trip) {
      return NextResponse.json({ error: "Missing message or trip" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: `You are Walter, an AI travel planner. The user has a trip itinerary and wants to refine it.
Return a JSON object with two keys:
1. "message" - a brief, friendly summary (1-2 sentences) of what you changed, written in first person (e.g. "I swapped the museum visit for a street food tour and adjusted the schedule accordingly.")
2. "trip" - the FULL updated trip with the same structure

Trip structure for the "trip" key:
{
  "tier": string,
  "title": string,
  "summary": string,
  "destination": string,
  "totalEstimatedCost": number,
  "days": [{ "dayNumber": number, "title": string, "summary": string, "estimatedCost": number, "items": [{ "itemType": string, "title": string, "description": string, "startTime": string|null, "endTime": string|null, "durationMinutes": number|null, "estimatedCost": number, "locationName": string, "locationLat": number|null, "locationLng": number|null, "rating": number|null }] }]
}

Rules:
- Keep the same JSON structure exactly
- Only change what the user requests
- Recalculate costs if items change
- Be creative but practical
- Do not use emojis in the message
- Return ONLY the JSON object with "message" and "trip" keys, no markdown fences`,
      messages: [
        {
          role: "user",
          content: `Here is the current trip:\n${JSON.stringify(trip)}\n\nQuiz preferences: ${JSON.stringify(quizData || {})}\n\nUser request: ${message}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Support both formats: { message, trip } wrapper or raw trip object
    const updatedTrip = parsed.trip || parsed;
    const walterMessage = parsed.message || null;

    return NextResponse.json({ trip: updatedTrip, message: walterMessage });
  } catch (err) {
    console.error("[refine]", err);
    return NextResponse.json({ error: "Failed to refine trip" }, { status: 500 });
  }
}
