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
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `You are Walter, an AI travel planner. The user has a trip itinerary and wants to refine it.
Return the FULL updated trip as valid JSON with the same structure. Only modify what the user asks for.

Trip structure:
{
  "tier": string,
  "title": string,
  "summary": string,
  "destination": string,
  "totalEstimatedCost": number,
  "days": [{ "dayNumber": number, "title": string, "summary": string, "estimatedCost": number, "items": [{ "itemType": string, "title": string, "description": string, "startTime": string|null, "endTime": string|null, "durationMinutes": number|null, "estimatedCost": number, "locationName": string, "rating": number|null }] }]
}

Rules:
- Keep the same JSON structure exactly
- Only change what the user requests
- Recalculate costs if items change
- Be creative but practical
- Return ONLY the JSON, no markdown fences`,
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
    const updatedTrip = JSON.parse(cleaned);

    return NextResponse.json({ trip: updatedTrip });
  } catch (err) {
    console.error("[refine]", err);
    return NextResponse.json({ error: "Failed to refine trip" }, { status: 500 });
  }
}
