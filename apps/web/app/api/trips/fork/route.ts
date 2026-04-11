import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { tripId } = await req.json();

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const { data: source, error: fetchError } = await supabase
      .from("trips")
      .select(`
        title, summary, destination, tier, start_date, end_date,
        total_estimated_cost, currency, cover_image_url,
        trip_days (
          day_number, title, summary, estimated_cost,
          trip_items (
            item_type, title, description, start_time, end_time,
            duration_minutes, estimated_cost, booking_url,
            affiliate_provider, external_id, location_name,
            location_lat, location_lng, rating, image_url,
            metadata, sort_order
          )
        )
      `)
      .eq("id", tripId)
      .eq("is_public", true)
      .single();

    if (fetchError || !source) {
      return NextResponse.json({ error: "Trip not found or not public" }, { status: 404 });
    }

    const newSlug = nanoid(10);

    const { data: newTrip, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: source.title,
        summary: source.summary,
        destination: source.destination,
        tier: source.tier,
        start_date: source.start_date,
        end_date: source.end_date,
        total_estimated_cost: source.total_estimated_cost,
        currency: source.currency,
        cover_image_url: source.cover_image_url,
        status: "draft",
        is_public: false,
        share_slug: newSlug,
        upvote_count: 0,
      })
      .select("id, share_slug")
      .single();

    if (tripError || !newTrip) {
      console.error("[/api/trips/fork] trip insert", tripError);
      return NextResponse.json({ error: "Failed to fork trip" }, { status: 500 });
    }

    const sortedDays = (source.trip_days || []).sort(
      (a: { day_number: number }, b: { day_number: number }) => a.day_number - b.day_number
    );

    for (const day of sortedDays) {
      const { data: newDay } = await supabase
        .from("trip_days")
        .insert({
          trip_id: newTrip.id,
          day_number: day.day_number,
          title: day.title,
          summary: day.summary,
          estimated_cost: day.estimated_cost,
        })
        .select("id")
        .single();

      if (newDay && day.trip_items && day.trip_items.length > 0) {
        const itemInserts = day.trip_items.map((item: Record<string, unknown>) => ({
          trip_day_id: newDay.id,
          trip_id: newTrip.id,
          item_type: item.item_type,
          title: item.title,
          description: item.description,
          start_time: item.start_time,
          end_time: item.end_time,
          duration_minutes: item.duration_minutes,
          estimated_cost: item.estimated_cost,
          booking_url: item.booking_url,
          affiliate_provider: item.affiliate_provider,
          external_id: item.external_id,
          location_name: item.location_name,
          location_lat: item.location_lat,
          location_lng: item.location_lng,
          rating: item.rating,
          image_url: item.image_url,
          metadata: item.metadata,
          sort_order: item.sort_order,
        }));

        await supabase.from("trip_items").insert(itemInserts);
      }
    }

    await supabase.from("saved_trips").insert({
      user_id: user.id,
      trip_id: newTrip.id,
    });

    return NextResponse.json({
      tripId: newTrip.id,
      shareSlug: newTrip.share_slug,
    });
  } catch (err) {
    console.error("[/api/trips/fork]", err);
    return NextResponse.json({ error: "Fork failed" }, { status: 500 });
  }
}
