import { NextRequest, NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/services/claude";
import {
  rateLimit,
  cleanString,
  cleanStringArray,
  clampInt,
  isReasonableDate,
} from "@/lib/apiGuard";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "suggestions", limit: 30 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const destination = cleanString(body?.destination, 80);
    const { startDate, endDate } = body ?? {};

    if (
      !destination ||
      !isReasonableDate(startDate) ||
      !isReasonableDate(endDate)
    ) {
      return NextResponse.json(
        { error: "Missing required fields: destination, startDate, endDate" },
        { status: 400 }
      );
    }

    const result = await generateSuggestions({
      destination,
      startDate,
      endDate,
      interests: cleanStringArray(body?.interests, 10, 40),
      travelers: clampInt(body?.travelers, 1, 10, 1),
      travelerType: cleanString(body?.travelerType, 30) || "travelers",
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
