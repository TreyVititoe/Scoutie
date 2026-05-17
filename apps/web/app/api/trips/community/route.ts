import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: trips, error } = await supabase
      .from("trips")
      .select("id, title, destination, total_estimated_cost, cover_image_url, upvote_count, share_slug, tier")
      .eq("is_public", true)
      .order("upvote_count", { ascending: false })
      .limit(24);

    if (error) {
      console.error("[/api/trips/community]", error);
      return NextResponse.json({ error: "Failed to fetch community trips" }, { status: 500 });
    }

    return NextResponse.json({ trips: trips || [] });
  } catch (err) {
    console.error("[/api/trips/community]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
