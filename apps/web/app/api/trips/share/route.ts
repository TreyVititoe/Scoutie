import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { nanoid } from "@/lib/utils";
import { clampInt, cleanString, rateLimit, readJsonCapped } from "@/lib/apiGuard";

// Schema CHECK constraint allows only these item_type values
const VALID_ITEM_TYPES = new Set(["flight", "hotel", "rental", "activity", "restaurant", "event", "transport", "note"]);

// Cart's "site" type maps to "activity" in the DB
function normalizeItemType(t: unknown): string {
  const s = typeof t === "string" ? t : "activity";
  if (s === "site") return "activity";
  return VALID_ITEM_TYPES.has(s) ? s : "activity";
}

// This route writes with the service role and needs no auth, so every page it
// mints is public and permanent. Caps below are what keeps it from being a
// free hosting surface for phishing links and arbitrary images.
const MAX_BODY = 64 * 1024;
const MAX_ITEMS = 60;
const MAX_COST = 10_000_000;

/** Only real http(s) URLs survive -- blocks javascript:, data:, and friends. */
function safeUrl(value: unknown): string | null {
  const s = cleanString(value, 2000);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** One sanitized trip_items row. Both the multi-day and single-day paths use
 *  this so neither can drift back to inserting raw client fields. */
function itemRow(
  item: Record<string, unknown>,
  idx: number,
  tripId: string,
  tripDayId: string
) {
  return {
    trip_day_id: tripDayId,
    trip_id: tripId,
    item_type: normalizeItemType(item.type),
    title: cleanString(item.title, 200) ?? "Untitled",
    description: cleanString(item.subtitle, 1000) ?? "",
    estimated_cost: clampInt(item.price, 0, MAX_COST, 0),
    location_name:
      cleanString((item.meta as Record<string, unknown>)?.locationName, 200) ?? "",
    image_url: safeUrl(item.image),
    booking_url: safeUrl(item.bookingUrl),
    sort_order: idx,
  };
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { name: "trips-share", limit: 20 });
  if (limited) return limited;

  try {
    const parsed = await readJsonCapped(req, MAX_BODY);
    if ("errorResponse" in parsed) return parsed.errorResponse;
    const {
      title: rawTitle,
      destination: rawDestination,
      totalCost: rawTotalCost,
      items: rawItems,
    } = (parsed.body ?? {}) as Record<string, unknown>;

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "No items to share" }, { status: 400 });
    }

    const title = cleanString(rawTitle, 200);
    const destination = cleanString(rawDestination, 200);
    const totalCost = clampInt(rawTotalCost, 0, MAX_COST, 0);
    const items = rawItems.slice(0, MAX_ITEMS) as Record<string, unknown>[];

    const shareSlug = nanoid(10);

    // Create trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .insert({
        title: title || `Trip to ${destination || "somewhere"}`,
        destination: destination || "Custom Trip",
        total_estimated_cost: totalCost || 0,
        status: "saved",
        is_public: true,
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
        // Clamped: day_number lands in a DB column and orders the whole page.
        const dayNum = clampInt(
          (item.meta as Record<string, unknown>)?.dayNumber,
          1,
          365,
          1
        );
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
              estimated_cost: dayItems.reduce(
                (sum: number, i: Record<string, unknown>) =>
                  sum + clampInt(i.price, 0, MAX_COST, 0),
                0
              ),
            })
            .select("id")
            .single();

          if (newDay) {
            const itemInserts = dayItems.map((item: Record<string, unknown>, idx: number) =>
              itemRow(item, idx, trip.id, newDay.id)
            );
            const { error: itemsErr } = await supabaseAdmin.from("trip_items").insert(itemInserts);
            if (itemsErr) console.error("[/api/trips/share] items insert (day", dayNum, ")", itemsErr);
          }
        }
      } else {
        // All items in the single day
        const itemInserts = items.map((item: Record<string, unknown>, idx: number) =>
          itemRow(item, idx, trip.id, day.id)
        );
        const { error: itemsErr } = await supabaseAdmin.from("trip_items").insert(itemInserts);
        if (itemsErr) console.error("[/api/trips/share] items insert", itemsErr);
      }
    }

    return NextResponse.json({ shareSlug: trip.share_slug });
  } catch (err) {
    console.error("[/api/trips/share]", err);
    return NextResponse.json({ error: "Share failed" }, { status: 500 });
  }
}
