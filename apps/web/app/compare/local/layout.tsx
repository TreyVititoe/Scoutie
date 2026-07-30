import type { Metadata } from "next";

/* Journey-internal: useful to a traveler mid-flow, thin duplicate content to
 * a crawler. Kept out of the index rather than out of the site. */
export const metadata: Metadata = {
  title: "Compare trips",
  robots: { index: false, follow: false },
};

export default function CompareLocalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
