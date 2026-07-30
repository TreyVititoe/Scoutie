import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { nanoid } from "@/lib/utils";
import { clampInt, cleanString, rateLimit, readJsonCapped } from "@/lib/apiGuard";

// A full multi-day itinerary is the payload; 64KB is generous for one trip.
const MAX_BODY = 64 * 1024;
const MAX_DAYS = 60;
const MAX_ITEMS_PER_DAY = 40;
const MAX_COST = 10_000_000;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "trips-save", limit: 30 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const parsed = await readJsonCapped(req, MAX_BODY);
    if ("errorResponse" in parsed) return parsed.errorResponse;
    const body = (parsed.body ?? {}) as Record<string, unknown>;
    const trip = body.trip as Record<string, unknown> | undefined;
    const quizData = body.quizData as Record<string, unknown> | undefined;

    if (!trip || !trip.title) {
      return NextResponse.json({ error: "Missing trip data" }, { status: 400 });
    }

    const isPublic = body.isPublic === true;

    // Save quiz response
    const { data: quizRow } = await supabase
      .from("quiz_responses")
      .insert({
        user_id: user.id,
        planning_mode: quizData?.planningMode || "destination",
        destinations: quizData?.destinations || [],
        start_date: quizData?.startDate || null,
        end_date: quizData?.endDate || null,
        travelers_count: quizData?.travelersCount || 1,
        traveler_type: quizData?.travelerType || "solo",
        budget_mode: quizData?.budgetMode || "total_trip",
        budget_amount: quizData?.budgetAmount || null,
        flight_preference: quizData?.flightClass || "economy",
        flight_priority: quizData?.flightPriority || "best_value",
        accommodation_type: quizData?.accommodationTypes || [],
        activity_interests: quizData?.activityInterests || [],
        dining_preference: quizData?.diningPreference || "mixed",
        pace: quizData?.pace || "moderate",
        departure_city: quizData?.departureCity || null,
      })
      .select("id")
      .single();

    // Save trip. A share_slug is minted only when the trip is actually public --
    // handing every private trip a slug is what made them all reachable by link.
    const { data: tripRow, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        quiz_response_id: quizRow?.id || null,
        title: cleanString(trip.title, 200),
        summary: cleanString(trip.summary, 2000),
        destination: cleanString(trip.destination, 200),
        tier: cleanString(trip.tier, 40) || "balanced",
        start_date: quizData?.startDate || null,
        end_date: quizData?.endDate || null,
        total_estimated_cost: clampInt(trip.totalEstimatedCost, 0, MAX_COST, 0),
        status: "saved",
        is_public: isPublic,
        share_slug: isPublic ? nanoid(10) : null,
      })
      .select("id, share_slug")
      .single();

    if (tripError || !tripRow) {
      console.error("[save trip]", tripError);
      return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
    }

    /* Day and item rows go in with the admin client. The user-scoped client
     * cannot write them: trip_days/trip_items have RLS on with SELECT policies
     * but no INSERT policy, so every insert was silently rejected and the route
     * returned a successful-looking, completely empty trip. Ownership is
     * already proven above -- these rows hang off a trip whose user_id is the
     * authenticated user. Errors now abort instead of being swallowed. */
    const days = Array.isArray(trip.days) ? trip.days.slice(0, MAX_DAYS) : [];

    for (const day of days as Record<string, unknown>[]) {
      const { data: dayRow, error: dayError } = await supabaseAdmin
        .from("trip_days")
        .insert({
          trip_id: tripRow.id,
          day_number: clampInt(day.dayNumber, 1, 365, 1),
          title: cleanString(day.title, 200),
          summary: cleanString(day.summary, 2000),
          estimated_cost: clampInt(day.estimatedCost, 0, MAX_COST, 0),
        })
        .select("id")
        .single();

      if (dayError || !dayRow) {
        console.error("[save trip] day insert", dayError);
        return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
      }

      const items = Array.isArray(day.items)
        ? (day.items as Record<string, unknown>[]).slice(0, MAX_ITEMS_PER_DAY)
        : [];
      if (items.length === 0) continue;

      const itemInserts = items.map((item, idx) => ({
        trip_day_id: dayRow.id,
        trip_id: tripRow.id,
        item_type: cleanString(item.itemType, 40) || "note",
        title: cleanString(item.title, 200) || "Untitled",
        description: cleanString(item.description, 2000),
        start_time: item.startTime || null,
        end_time: item.endTime || null,
        duration_minutes: item.durationMinutes ?? null,
        estimated_cost: clampInt(item.estimatedCost, 0, MAX_COST, 0),
        location_name: cleanString(item.locationName, 200),
        location_lat: item.locationLat ?? null,
        location_lng: item.locationLng ?? null,
        rating: item.rating ?? null,
        sort_order: idx,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from("trip_items")
        .insert(itemInserts);

      if (itemsError) {
        console.error("[save trip] items insert", itemsError);
        return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
      }
    }

    // Also save to saved_trips
    const { error: savedError } = await supabase.from("saved_trips").insert({
      user_id: user.id,
      trip_id: tripRow.id,
    });
    if (savedError) console.error("[save trip] saved_trips", savedError);

    return NextResponse.json({
      tripId: tripRow.id,
      shareSlug: tripRow.share_slug,
    });
  } catch (err) {
    console.error("[/api/trips/save]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
