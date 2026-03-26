"use client";

import Link from "next/link";
import { useTripStore } from "@/lib/store";

export default function ProfilePage() {
  const { savedTrips } = useTripStore();

  return (
    <div className="py-8 space-y-8 max-w-md mx-auto">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0c8eeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Traveler</h1>
        <p className="text-sm text-gray-400">Your Scoutie profile</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Trips Saved", value: savedTrips.length },
          { label: "Destinations", value: new Set(savedTrips.map((t) => t.plan.destination)).size },
          { label: "Countries", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {[
          { label: "My Saved Trips", href: "/saved" },
          { label: "Travel Preferences", href: "/quiz" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">{item.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-300">Scoutie v0.1.0</p>
      </div>
    </div>
  );
}
