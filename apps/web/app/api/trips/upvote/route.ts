import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cleanString, rateLimit } from "@/lib/apiGuard";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "upvote", limit: 60 });
  if (limited) return limited;

  try {
    const { tripId: rawTripId } = await req.json();
    const tripId = cleanString(rawTripId, 64);

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    /* One vote per IP per trip per day. Without this, opening the update path
     * at all would make community trips freely re-votable by anyone. Shares
     * the rate limiter's bounded store, so it is per-instance and
     * best-effort -- the same caveat that applies to every limit here. */
    const duplicate = rateLimit(req, {
      name: `upvote:${tripId}`,
      limit: 1,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (duplicate) {
      return NextResponse.json({ error: "Already voted" }, { status: 429 });
    }

    /* Admin client on purpose. Community trips have user_id NULL and the only
     * UPDATE policy is auth.uid() = user_id, so the user-scoped client matched
     * zero rows and the route 500'd for everyone. The is_public check below is
     * what constrains this -- only published trips can be voted on. */
    const { data: trip, error: fetchError } = await supabaseAdmin
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

    /* Guarded on the count we read, so two concurrent votes cannot both write
     * the same value and silently lose one. A miss means someone else voted
     * first; the caller can retry. */
    const current = trip.upvote_count ?? 0;
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("trips")
      .update({ upvote_count: current + 1 })
      .eq("id", tripId)
      .eq("upvote_count", current)
      .select("upvote_count")
      .single();

    if (updateError || !updated) {
      console.error("[/api/trips/upvote]", updateError);
      return NextResponse.json({ error: "Failed to upvote" }, { status: 409 });
    }

    return NextResponse.json({ upvoteCount: updated.upvote_count });
  } catch (err) {
    console.error("[/api/trips/upvote]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
