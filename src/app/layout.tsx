import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoutie — AI Trip Planner",
  description: "Plan your perfect trip with AI-powered recommendations for flights, hotels, events, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <Header />
        <main className="max-w-5xl mx-auto px-4 pb-20 sm:pb-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
