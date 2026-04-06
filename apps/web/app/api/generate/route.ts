import { NextRequest, NextResponse } from "next/server";
import { generateTrips } from "@/lib/services/claude";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const quizData = await req.json();
    const result = await generateTrips(quizData);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/generate]", message);
    return NextResponse.json(
      { error: `Trip generation failed: ${message}` },
      { status: 500 }
    );
  }
}
