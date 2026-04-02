import { NextRequest } from "next/server";
import { generateTripsStream } from "@/lib/services/claude";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const quizData = await req.json();

    const stream = await generateTripsStream(quizData);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("[/api/generate]", err);
    return Response.json(
      { error: "Trip generation failed. Check your API keys." },
      { status: 500 }
    );
  }
}
