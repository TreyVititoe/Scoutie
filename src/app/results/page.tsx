"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore, useTripStore } from "@/lib/store";
import FlightCard from "@/components/cards/FlightCard";
import AccommodationCard from "@/components/cards/AccommodationCard";
import EventCard from "@/components/cards/EventCard";
import type { TripPlan } from "@/types";

type Tab = "overview" | "flights" | "stays" | "events" | "itinerary";

export default function ResultsPage() {
  const router = useRouter();
  const { preferences } = useQuizStore();
  const { setCurrentPlan, saveTrip } = useTripStore();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!preferences.destination) {
      router.push("/quiz");
      return;
    }

    async function fetchPlan() {
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        });
        const data = await res.json();
        setPlan(data);
        setCurrentPlan(data);
      } catch {
        router.push("/quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <div className="text-center">
          <p className="font-semibold text-gray-900">Building your trip...</p>
          <p className="text-sm text-gray-400">Finding the best options for {preferences.destination}</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "flights", label: `Flights (${plan.flights.length})` },
    { key: "stays", label: `Stays (${plan.accommodations.length})` },
    { key: "events", label: `Events (${plan.events.length})` },
    { key: "itinerary", label: "Itinerary" },
  ];

  const handleSave = () => {
    saveTrip(`${plan.destination} Trip`);
    setSaved(true);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your {plan.destination} Trip</h1>
          <p className="text-sm text-gray-500 mt-1">{plan.summary}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saved}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {saved ? "Saved!" : "Save Trip"}
        </button>
      </div>

      {/* Budget summary */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Estimated total</p>
          <p className="text-2xl font-bold text-gray-900">${plan.totalBudget.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{plan.startDate} → {plan.endDate}</p>
          <p className="text-sm text-gray-400">{preferences.travelers} traveler{preferences.travelers > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Section title="Best Flight">
            <FlightCard flight={plan.flights[0]} />
          </Section>
          <Section title="Top Stay">
            <div className="grid sm:grid-cols-2 gap-4">
              {plan.accommodations.slice(0, 2).map((a) => (
                <AccommodationCard key={a.id} accommodation={a} />
              ))}
            </div>
          </Section>
          <Section title="Top Events">
            <div className="grid sm:grid-cols-2 gap-4">
              {plan.events.slice(0, 2).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {activeTab === "flights" && (
        <div className="space-y-4">
          {plan.flights.map((f) => (
            <FlightCard key={f.id} flight={f} />
          ))}
        </div>
      )}

      {activeTab === "stays" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {plan.accommodations.map((a) => (
            <AccommodationCard key={a.id} accommodation={a} />
          ))}
        </div>
      )}

      {activeTab === "events" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {plan.events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      {activeTab === "itinerary" && (
        <div className="space-y-6">
          {plan.itinerary.map((day) => (
            <div key={day.day} className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Day {day.day} <span className="text-sm font-normal text-gray-400">· {day.date}</span>
              </h3>
              <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                {day.activities.map((act, i) => (
                  <div key={i} className="relative pl-4">
                    <div className="absolute -left-[9px] top-1.5 w-3 h-3 bg-white border-2 border-brand-300 rounded-full" />
                    <p className="text-xs text-gray-400">{act.time}</p>
                    <p className="text-sm font-medium text-gray-900">{act.title}</p>
                    <p className="text-xs text-gray-500">{act.description}</p>
                    {act.cost > 0 && (
                      <p className="text-xs text-brand-600 font-medium">${act.cost}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button onClick={() => router.push("/quiz")} className="btn-secondary flex-1">
          Start Over
        </button>
        <button onClick={handleSave} disabled={saved} className="btn-primary flex-1">
          {saved ? "Saved!" : "Save This Trip"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
