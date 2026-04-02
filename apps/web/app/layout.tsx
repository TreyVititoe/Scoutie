import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walter — One Quiz. Your Whole Trip.",
  description:
    "AI-powered trip planning. Take a quick quiz, get complete bookable itineraries with flights, hotels, activities, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
