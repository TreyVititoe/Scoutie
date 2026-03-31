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

    const body = await req.json();
    const { trip, quizData } = body;

    if (!trip || !trip.title) {
      return NextResponse.json({ error: "Missing trip data" }, { status: 400 });
    }

    const shareSlug = nanoid(10);

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

    // Save trip
    const { data: tripRow, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        quiz_response_id: quizRow?.id || null,
        title: trip.title,
        summary: trip.summary || null,
        destination: trip.destination,
        tier: trip.tier || "balanced",
        start_date: quizData?.startDate || null,
        end_date: quizData?.endDate || null,
        total_estimated_cost: trip.totalEstimatedCost || 0,
        status: "saved",
        is_public: false,
        share_slug: shareSlug,
      })
      .select("id, share_slug")
      .single();

    if (tripError) {
      console.error("[save trip]", tripError);
      return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
    }

    // Save trip days + items
    if (trip.days && tripRow) {
      for (const day of trip.days) {
        const { data: dayRow } = await supabase
          .from("trip_days")
          .insert({
            trip_id: tripRow.id,
            day_number: day.dayNumber,
            title: day.title || null,
            summary: day.summary || null,
            estimated_cost: day.estimatedCost || 0,
          })
          .select("id")
          .single();

        if (dayRow && day.items) {
          const itemInserts = day.items.map(
            (item: Record<string, unknown>, idx: number) => ({
              trip_day_id: dayRow.id,
              trip_id: tripRow.id,
              item_type: item.itemType || "note",
              title: item.title || "Untitled",
              description: item.description || null,
              start_time: item.startTime || null,
              end_time: item.endTime || null,
              duration_minutes: item.durationMinutes || null,
              estimated_cost: item.estimatedCost || 0,
              location_name: item.locationName || null,
              location_lat: item.locationLat || null,
              location_lng: item.locationLng || null,
              rating: item.rating || null,
              sort_order: idx,
            })
          );

          await supabase.from("trip_items").insert(itemInserts);
        }
      }
    }

    // Also save to saved_trips
    await supabase.from("saved_trips").insert({
      user_id: user.id,
      trip_id: tripRow.id,
    });

    return NextResponse.json({
      tripId: tripRow.id,
      shareSlug: tripRow.share_slug,
    });
  } catch (err) {
    console.error("[/api/trips/save]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
