import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseClaudeJson(text: string) {
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
  try { return JSON.parse(cleaned); } catch { /* noop */ }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) { try { return JSON.parse(jsonMatch[0]); } catch { /* noop */ } }
  // Repair truncated JSON
  let repaired = cleaned;
  repaired = repaired.replace(/,\s*[^{}\[\]"]*$/, "");
  // Close unclosed strings
  let inStr = false, esc = false, lastQuoteIdx = -1;
  for (let i = 0; i < repaired.length; i++) {
    if (esc) { esc = false; continue; }
    if (repaired[i] === "\\") { esc = true; continue; }
    if (repaired[i] === '"') { inStr = !inStr; lastQuoteIdx = i; }
  }
  if (inStr && lastQuoteIdx >= 0) repaired = repaired.slice(0, lastQuoteIdx + 1);
  if (inStr) repaired += '"';
  // Close brackets
  let ob = 0, oq = 0; inStr = false; esc = false;
  for (const ch of repaired) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") ob++; if (ch === "}") ob--;
    if (ch === "[") oq++; if (ch === "]") oq--;
  }
  for (let i = 0; i < oq; i++) repaired += "]";
  for (let i = 0; i < ob; i++) repaired += "}";
  try { return JSON.parse(repaired); } catch { throw new Error("Could not parse AI response"); }
}

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

Generate 3 diverse trip options as JSON. If the user specified dates or a duration, use those exact dates/duration. Otherwise default to 3 days. Keep descriptions very short to avoid truncation. Assume a moderate budget of $2,000-3,000 unless they specified otherwise.`;

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
    const parsed = parseClaudeJson(text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/quick]", message);
    return NextResponse.json({ error: `Quick plan failed: ${message}` }, { status: 500 });
  }
}
