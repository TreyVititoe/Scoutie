import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const maxDuration = 300;

const SYSTEM_PROMPT = `You are Walter, an expert AI travel planner. A user will give you a list of freeform keywords describing what they want in a trip. These could be ANYTHING: cities, countries, artists, activities, vibes, foods, dates, budgets, events, sports teams, TV shows, anything.

Your job: interpret ALL their keywords and generate 3 trip options that incorporate as many of their interests as possible.

RULES:
- Every recommendation must be a REAL place
- Include specific names and approximate prices in USD
- Structure each day with morning, afternoon, and evening blocks
- Max 3 items per day
- Descriptions MUST be under 10 words each
- Keep ALL string values SHORT — summaries under 20 words, titles under 8 words
- Use ASCII characters only
- Raw JSON only — no markdown, no code fences, no explanation
- The summary should explain WHY this trip matches their keywords

RESPONSE FORMAT:
{"trips":[{"destination":"City, Country","title":"...","summary":"One sentence explaining why this matches their keywords","totalEstimatedCost":0,"flightEstimate":0,"hotelEstimatePerNight":0,"topEvents":["Event 1","Event 2","Event 3"],"highlights":["Highlight 1","Highlight 2","Highlight 3"],"bestTimeToVisit":"...","days":[{"dayNumber":1,"title":"...","items":[{"itemType":"activity","title":"...","description":"...","startTime":"09:00","estimatedCost":0,"locationName":"..."}]}]}]}

Generate EXACTLY 3 trips. Each should interpret the keywords differently — different destinations, different angles on the same interests.`;

export async function POST(req: NextRequest) {
  try {
    const { tags } = await req.json();

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: "No tags provided" }, { status: 400 });
    }

    const userPrompt = `Plan 3 trip options based on these interests and keywords:

${tags.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

Interpret these creatively:
- If they mention an artist/band, find where they're performing or where they're from
- If they mention a food, find the best city for it
- If they mention a sport/team, find where they play
- If they mention a vibe (romantic, adventure, party), pick destinations that match
- If they mention a specific place, include it
- If they mention dates or a month, note it in the trip
- If they mention a budget, respect it

Generate 3 diverse trip options as JSON. Each trip should be 4-5 days. Assume a moderate budget of $2,000-3,000 unless they specified otherwise.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    if (message.stop_reason === "max_tokens") {
      return NextResponse.json({ error: "Response too long — try fewer tags" }, { status: 500 });
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse with repair
    let parsed;
    try {
      const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to repair truncated JSON
      let repaired = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
      repaired = repaired.replace(/,\s*[^{}\[\]"]*$/, "");
      let openBraces = 0, openBrackets = 0, inString = false, escaped = false;
      for (const ch of repaired) {
        if (escaped) { escaped = false; continue; }
        if (ch === "\\") { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === "{") openBraces++;
        if (ch === "}") openBraces--;
        if (ch === "[") openBrackets++;
        if (ch === "]") openBrackets--;
      }
      for (let i = 0; i < openBrackets; i++) repaired += "]";
      for (let i = 0; i < openBraces; i++) repaired += "}";
      parsed = JSON.parse(repaired);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/quick]", message);
    return NextResponse.json({ error: `Quick plan failed: ${message}` }, { status: 500 });
  }
}
