import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch trip by share_slug (public trips or own trips)
  const { data: trip, error } = await supabase
    .from("trips")
    .select(`
      id, title, summary, destination, tier, start_date, end_date,
      total_estimated_cost, is_public, share_slug,
      trip_days (
        id, day_number, title, summary, estimated_cost,
        trip_items (
          id, item_type, title, description, start_time, end_time,
          duration_minutes, estimated_cost, location_name,
          location_lat, location_lng, rating, sort_order
        )
      )
    `)
    .eq("share_slug", slug)
    .single();

  if (error || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Sort days and items
  const days = (trip.trip_days || [])
    .sort((a: { day_number: number }, b: { day_number: number }) => a.day_number - b.day_number)
    .map((day: { trip_items?: { sort_order: number }[] } & Record<string, unknown>) => ({
      ...day,
      trip_items: (day.trip_items || []).sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
      ),
    }));

  return NextResponse.json({
    trip: {
      ...trip,
      trip_days: days,
    },
  });
}
