import type { Metadata } from "next";

/* Journey-internal: useful to a traveler mid-flow, thin duplicate content to
 * a crawler. Kept out of the index rather than out of the site. */
export const metadata: Metadata = {
  title: "Refine your trip",
  robots: { index: false, follow: false },
};

export default function ClarifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
