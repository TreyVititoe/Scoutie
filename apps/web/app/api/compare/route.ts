import { NextRequest, NextResponse } from "next/server";
import { generateCompareTrips } from "@/lib/services/claude";
import { rateLimit, readJsonCapped } from "@/lib/apiGuard";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "compare", limit: 10 });
  if (limited) return limited;

  try {
    const parsed = await readJsonCapped(req);
    if ("errorResponse" in parsed) return parsed.errorResponse;
    const quizData = parsed.body as Parameters<typeof generateCompareTrips>[0];
    const result = await generateCompareTrips(quizData);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/compare]", message);
    return NextResponse.json(
      { error: `Comparison generation failed: ${message}` },
      { status: 500 }
    );
  }
}
