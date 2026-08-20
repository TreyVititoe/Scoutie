import { NextRequest, NextResponse } from "next/server";

import { rateLimit, readJsonCapped } from "@/lib/apiGuard";
import { walterChat, type WalterChatTurn } from "@/lib/services/walterChat";

export const maxDuration = 60;

const MAX_TURNS = 24;
const MAX_TURN_CHARS = 2000;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { name: "chat", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const parsed = await readJsonCapped(req, 64 * 1024);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  const raw = Array.isArray((parsed.body as { messages?: unknown })?.messages)
    ? ((parsed.body as { messages: unknown[] }).messages as unknown[])
    : null;
  if (!raw || raw.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const turns: WalterChatTurn[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    if (!item || typeof item !== "object") continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    turns.push({ role, content: content.trim().slice(0, MAX_TURN_CHARS) });
  }
  if (!turns.length || turns[turns.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "last message must be from the user" },
      { status: 400 }
    );
  }
  /* The API requires the first message to be a user turn; trimming to
   * MAX_TURNS can leave an assistant turn first. */
  while (turns.length && turns[0].role !== "user") turns.shift();

  try {
    const result = await walterChat(turns);
    return NextResponse.json(result);
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Walter stepped away for a moment. Try again." },
      { status: 502 }
    );
  }
}
