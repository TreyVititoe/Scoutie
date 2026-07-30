import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Walter",
  description:
    "Why Walter exists: one search instead of ten tabs, and a complete bookable itinerary at the end of it.",
  openGraph: {
    title: "About Walter",
    description: "Why Walter exists: one search instead of ten tabs, and a complete bookable itinerary at the end of it.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
