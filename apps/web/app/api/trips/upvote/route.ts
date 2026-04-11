import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { tripId } = await req.json();

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: trip, error: fetchError } = await supabase
      .from("trips")
      .select("id, upvote_count, is_public")
      .eq("id", tripId)
      .single();

    if (fetchError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (!trip.is_public) {
      return NextResponse.json({ error: "Trip is not public" }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("trips")
      .update({ upvote_count: trip.upvote_count + 1 })
      .eq("id", tripId)
      .select("upvote_count")
      .single();

    if (updateError) {
      console.error("[/api/trips/upvote]", updateError);
      return NextResponse.json({ error: "Failed to upvote" }, { status: 500 });
    }

    return NextResponse.json({ upvoteCount: updated.upvote_count });
  } catch (err) {
    console.error("[/api/trips/upvote]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
