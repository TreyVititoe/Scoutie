import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Footer from "../components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walter. The world is wasted on people who stay home.",
  description:
    "Tell Walter a few facts and he builds a real trip: flights, hotels, activities, all in one place. Book each piece in a click.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="font-sans bg-page-bg text-ink antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
