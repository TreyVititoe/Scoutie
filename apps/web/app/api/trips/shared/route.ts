import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/apiGuard";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, { name: "trips-shared", limit: 120 });
  if (limited) return limited;

  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");

  if (!slug && !id) {
    return NextResponse.json({ error: "Missing slug or id" }, { status: 400 });
  }

  // Admin client bypasses RLS, so is_public is the ONLY thing standing between
  // a link and someone's private trip -- it must be filtered on, not just
  // selected. Without it every saved trip was world-readable by slug or uuid.
  let query = supabaseAdmin
    .from("trips")
    .select(`
      id, title, summary, destination, tier, start_date, end_date,
      total_estimated_cost, is_public, share_slug,
      trip_days (
        id, day_number, title, summary, estimated_cost,
        trip_items (
          id, item_type, title, description, start_time, end_time,
          duration_minutes, estimated_cost, location_name,
          location_lat, location_lng, rating, sort_order,
          image_url, booking_url
        )
      )
    `);

  query = query.eq("is_public", true);

  if (id) {
    query = query.eq("id", id);
  } else {
    query = query.eq("share_slug", slug!);
  }

  const { data: trip, error } = await query.single();

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
