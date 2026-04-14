import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { nanoid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { title, destination, totalCost, items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items to share" }, { status: 400 });
    }

    const shareSlug = nanoid(10);

    // Create trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .insert({
        title: title || `Trip to ${destination || "somewhere"}`,
        destination: destination || "Custom Trip",
        total_estimated_cost: totalCost || 0,
        status: "saved",
        is_public: false,
        share_slug: shareSlug,
        upvote_count: 0,
      })
      .select("id, share_slug")
      .single();

    if (tripError || !trip) {
      console.error("[/api/trips/share]", tripError);
      return NextResponse.json({ error: "Failed to create shared trip" }, { status: 500 });
    }

    // Create a single day with all items
    const { data: day } = await supabaseAdmin
      .from("trip_days")
      .insert({
        trip_id: trip.id,
        day_number: 1,
        title: destination || "Your Trip",
        summary: `${items.length} items`,
        estimated_cost: totalCost || 0,
      })
      .select("id")
      .single();

    if (day) {
      // Group items by day number if available, otherwise all in day 1
      const dayGroups = new Map<number, typeof items>();
      items.forEach((item: Record<string, unknown>) => {
        const dayNum = (item.meta as Record<string, unknown>)?.dayNumber as number || 1;
        if (!dayGroups.has(dayNum)) dayGroups.set(dayNum, []);
        dayGroups.get(dayNum)!.push(item);
      });

      // If items have day numbers, create proper days
      if (dayGroups.size > 1) {
        // Delete the placeholder day 1
        await supabaseAdmin.from("trip_days").delete().eq("id", day.id);

        for (const [dayNum, dayItems] of dayGroups) {
          const { data: newDay } = await supabaseAdmin
            .from("trip_days")
            .insert({
              trip_id: trip.id,
              day_number: dayNum,
              title: `Day ${dayNum}`,
              estimated_cost: dayItems.reduce((sum: number, i: Record<string, unknown>) => sum + ((i.price as number) || 0), 0),
            })
            .select("id")
            .single();

          if (newDay) {
            const itemInserts = dayItems.map((item: Record<string, unknown>, idx: number) => ({
              trip_day_id: newDay.id,
              trip_id: trip.id,
              item_type: (item.type as string) || "activity",
              title: (item.title as string) || "Untitled",
              description: (item.subtitle as string) || "",
              estimated_cost: (item.price as number) || 0,
              location_name: ((item.meta as Record<string, unknown>)?.locationName as string) || "",
              image_url: (item.image as string) || null,
              booking_url: (item.bookingUrl as string) || null,
              sort_order: idx,
            }));
            await supabaseAdmin.from("trip_items").insert(itemInserts);
          }
        }
      } else {
        // All items in the single day
        const itemInserts = items.map((item: Record<string, unknown>, idx: number) => ({
          trip_day_id: day.id,
          trip_id: trip.id,
          item_type: (item.type as string) || "activity",
          title: (item.title as string) || "Untitled",
          description: (item.subtitle as string) || "",
          estimated_cost: (item.price as number) || 0,
          location_name: ((item.meta as Record<string, unknown>)?.locationName as string) || "",
          image_url: (item.image as string) || null,
          booking_url: (item.bookingUrl as string) || null,
          sort_order: idx,
        }));
        await supabaseAdmin.from("trip_items").insert(itemInserts);
      }
    }

    return NextResponse.json({ shareSlug: trip.share_slug });
  } catch (err) {
    console.error("[/api/trips/share]", err);
    return NextResponse.json({ error: "Share failed" }, { status: 500 });
  }
}
