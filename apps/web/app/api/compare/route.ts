import { NextRequest, NextResponse } from "next/server";
import { generateCompareTrips } from "@/lib/services/claude";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const quizData = await req.json();
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
