import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore destinations",
  description:
    "Browse destinations Walter plans well, then hand one to the search bar and get a full itinerary back.",
  openGraph: {
    title: "Explore destinations",
    description: "Browse destinations Walter plans well, then hand one to the search bar and get a full itinerary back.",
    url: "/explore",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
