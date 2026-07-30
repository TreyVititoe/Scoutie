import type { Metadata } from "next";

/* Journey-internal: useful to a traveler mid-flow, thin duplicate content to
 * a crawler. Kept out of the index rather than out of the site. */
export const metadata: Metadata = {
  title: "Booking checklist",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
