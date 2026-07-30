import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cleanString, rateLimit, readJsonCapped } from "@/lib/apiGuard";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "affiliate-click", limit: 120 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const parsed = await readJsonCapped(req, 4 * 1024);
    if ("errorResponse" in parsed) return parsed.errorResponse;
    const { tripId, provider, destinationUrl } = (parsed.body ?? {}) as Record<
      string,
      unknown
    >;

    const providerName = cleanString(provider, 100);
    const url = cleanString(destinationUrl, 2000);
    if (!providerName || !url) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    /* Written with the admin client. Most clicks are logged out, and the only
     * INSERT policy on affiliate_clicks requires auth.uid() = user_id, so the
     * user-scoped client dropped every anonymous click while still returning
     * ok:true -- attribution was silently dead. Two column names were wrong
     * too: the schema has click_url (not destination_url) and no item_type
     * column at all, so those values went nowhere. */
    const { error } = await supabaseAdmin.from("affiliate_clicks").insert({
      user_id: user?.id ?? null,
      trip_id: cleanString(tripId, 64),
      provider: providerName,
      click_url: url,
    });

    if (error) {
      console.error("[affiliate click]", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[affiliate click]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
