import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "../components/Footer";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://scoutie.vercel.app";
const TITLE = "Walter. The world is wasted on people who stay home.";
const DESCRIPTION =
  "Tell Walter a few facts and he builds a real trip: flights, hotels, activities, all in one place. Book each piece in a click.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Walter",
  },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Walter",
    type: "website",
    images: [{ url: "/new_walter_hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/new_walter_hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="font-sans bg-page-bg text-ink antialiased">
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
