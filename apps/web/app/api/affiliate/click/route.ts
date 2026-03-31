import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { tripId, provider, itemType, destinationUrl } = body;

    if (!provider || !destinationUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await supabase.from("affiliate_clicks").insert({
      user_id: user?.id || null,
      trip_id: tripId || null,
      provider,
      item_type: itemType || null,
      destination_url: destinationUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[affiliate click]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
