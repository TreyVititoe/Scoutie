import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Footer from "../components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoutie -- One Quiz. Your Whole Trip.",
  description:
    "AI-powered trip planning. Take a quick quiz, get complete bookable itineraries with flights, hotels, activities, and more.",
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
      <body className="font-sans bg-gray-light text-gray-dark antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
