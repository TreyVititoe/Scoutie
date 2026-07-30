import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

/* Shared links are the one surface that travels: someone sends a trip to a
 * group chat and the unfurl is all anyone sees first. The page itself is a
 * client component and cannot export metadata, so this server layout wraps it
 * purely to fill in the preview. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: trip } = await supabaseAdmin
    .from("trips")
    .select("title, summary, destination, total_estimated_cost")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (!trip) {
    return {
      title: "Trip not found",
      robots: { index: false, follow: false },
    };
  }

  const title = trip.title || `Trip to ${trip.destination}`;
  const description =
    trip.summary ||
    `A ${trip.destination} itinerary built on Walter: flights, stays, and things worth doing.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/shared/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function SharedTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
