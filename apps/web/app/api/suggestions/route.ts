import { NextRequest, NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/services/claude";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, startDate, endDate, interests, travelers, travelerType } = body;

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: destination, startDate, endDate" },
        { status: 400 }
      );
    }

    const result = await generateSuggestions({
      destination,
      startDate,
      endDate,
      interests: interests || [],
      travelers: travelers || 1,
      travelerType: travelerType || "travelers",
    });

    // Add IDs to suggestions if missing
    const suggestions = (result.suggestions || []).map(
      (s: Record<string, unknown>, i: number) => ({
        ...s,
        id: s.id || `suggestion-${i}`,
      })
    );

    return NextResponse.json({ suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/suggestions]", message);
    return NextResponse.json(
      { error: `Suggestion generation failed: ${message}` },
      { status: 500 }
    );
  }
}
