"use client";

/*
 * The trip on a map: every stay and event for the current plan as a pin.
 * Click a pin for its card; add it to the cart right there. Same data as
 * /results, spatial instead of listed.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { prefInterests, readStored, type StoredPrefs } from "@/lib/prefs";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import type { HotelResult } from "@/lib/services/hotels";
import type { ScoredEvent } from "@/lib/types";

type PinKind = "stay" | "event";

type Pin = {
  id: string;
  kind: PinKind;
  title: string;
  subtitle: string;
  cartPrice: number | null;
  lat: number;
  lng: number;
  bookingUrl: string | null;
  image: string | null;
  provider: string;
  date: string | null;
  meta: Record<string, unknown>;
};

const EVENT_PIN = "#1F2733";
const STAY_PIN = "#5B8DEF";

export default function MapPage() {
  const [prefs, setPrefs] = useState<StoredPrefs | null>(null);
  const [ready, setReady] = useState(false);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [events, setEvents] = useState<ScoredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStays, setShowStays] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [selected, setSelected] = useState<Pin | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>(null);

  const items = useTripCartStore((s) => s.items);
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const inCart = selected ? items.some((i) => i.id === selected.id) : false;

  useEffect(() => {
    setPrefs(readStored<StoredPrefs>("walter_prefs", {}));
    setReady(true);
  }, []);

  const destination: string =
    (prefs?.destinations as string[] | undefined)?.[0] ||
    (prefs?.destination as string | undefined) ||
    "";
  const startDate = (prefs?.startDate as string) || "";
  const endDate = (prefs?.endDate as string) || "";
  const travelers =
    Number(prefs?.travelersCount) || Number(prefs?.travelers) || 2;
  const hasTrip = !!(destination && startDate && endDate);

  /* Fetch stays + events once the trip facts exist. */
  useEffect(() => {
    if (!hasTrip || !prefs) return;
    let cancelled = false;
    const hc = new AbortController();
    const ec = new AbortController();
    const timers = [
      setTimeout(() => hc.abort(), 15000),
      setTimeout(() => ec.abort(), 30000),
    ];
    Promise.allSettled([
      fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          checkIn: startDate,
          checkOut: endDate,
          adults: travelers,
          stayType: "hotel",
        }),
        signal: hc.signal,
      }).then((r) => r.json()),
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          vibes: prefInterests(prefs),
          description: (prefs.description as string) || "",
          travelers,
        }),
        signal: ec.signal,
      }).then((r) => r.json()),
    ]).then(([h, e]) => {
      timers.forEach(clearTimeout);
      if (cancelled) return;
      if (h.status === "fulfilled") {
        setHotels((h.value?.hotels as HotelResult[]) || []);
      }
      if (e.status === "fulfilled") {
        setEvents([
          ...((e.value?.exactMatches as ScoredEvent[]) || []),
          ...((e.value?.similarMatches as ScoredEvent[]) || []),
          ...((e.value?.topInArea as ScoredEvent[]) || []),
        ]);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      hc.abort();
      ec.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTrip, destination, startDate, endDate]);

  /* Boot the map and fly to the destination. */
  useEffect(() => {
    if (!hasTrip || !mapContainerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 1.4,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    mapRef.current = map;
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?types=place&limit=1&access_token=${token}`
    )
      .then((r) => r.json())
      .then((data) => {
        const c = data?.features?.[0]?.center;
        if (Array.isArray(c) && c.length === 2) {
          map.flyTo({ center: [c[0], c[1]], zoom: 11.5, duration: 1600 });
        }
      })
      .catch(() => {});
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTrip, destination]);

  const buildPins = useCallback((): Pin[] => {
    const out: Pin[] = [];
    if (showStays) {
      for (const h of hotels) {
        if (h.latitude == null || h.longitude == null) continue;
        out.push({
          id: h.id,
          kind: "stay",
          title: h.name,
          subtitle:
            h.rating > 0
              ? `${h.rating}/10 · $${h.pricePerNight}/night`
              : `$${h.pricePerNight}/night`,
          cartPrice: h.totalPrice,
          lat: h.latitude,
          lng: h.longitude,
          bookingUrl: h.bookingUrl,
          image: h.image,
          provider: "booking",
          date: null,
          meta: h as unknown as Record<string, unknown>,
        });
      }
    }
    if (showEvents) {
      for (const e of events) {
        if (e.venueLat == null || e.venueLng == null) continue;
        out.push({
          id: e.id,
          kind: "event",
          title: e.name,
          subtitle: `${e.venueName}${e.priceMin != null ? ` · from $${e.priceMin}` : ""}`,
          cartPrice: e.priceMin != null ? e.priceMin * travelers : null,
          lat: e.venueLat,
          lng: e.venueLng,
          bookingUrl: e.url,
          image: e.image,
          provider: "ticketmaster",
          date: e.date,
          meta: e as unknown as Record<string, unknown>,
        });
      }
    }
    return out;
  }, [hotels, events, showStays, showEvents, travelers]);

  /* Redraw markers when data or layer toggles change. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const m of markersRef.current ?? []) m.remove();
    const markers: mapboxgl.Marker[] = [];
    for (const pin of buildPins()) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute(
        "aria-label",
        `${pin.kind === "stay" ? "Stay" : "Event"}: ${pin.title}`
      );
      el.style.cssText = `width:26px;height:26px;border-radius:50%;border:2px solid #fff;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35);background:${
        pin.kind === "stay" ? STAY_PIN : EVENT_PIN
      };`;
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        setSelected(pin);
      });
      markers.push(
        new mapboxgl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map)
      );
    }
    markersRef.current = markers;
  }, [buildPins]);

  if (!ready) return null;

  if (!hasTrip) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="material-symbols-outlined text-ink-faint text-4xl mb-4">map</span>
          <h1 className="text-ink text-[24px] font-semibold">
            The map needs a trip first
          </h1>
          <p className="text-ink-soft text-sm mt-2 max-w-[40ch]">
            Pick a destination and dates, then come back to see every stay and
            event laid out on the map.
          </p>
          <Link
            href="/"
            className="mt-6 bg-accent text-white rounded-pill px-6 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Start a trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-page-bg flex flex-col overflow-hidden">
      <Header />
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Layer toggles */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          {(
            [
              { label: `Stays${hotels.length ? ` (${hotels.length})` : ""}`, on: showStays, set: setShowStays, dot: STAY_PIN },
              { label: `Events${events.length ? ` (${events.length})` : ""}`, on: showEvents, set: setShowEvents, dot: EVENT_PIN },
            ] as const
          ).map((l) => (
            <button
              key={l.label}
              type="button"
              aria-pressed={l.on}
              onClick={() => l.set(!l.on)}
              className={`flex items-center gap-2 px-4 py-2 rounded-pill text-[13px] font-semibold border transition-colors shadow-sm ${
                l.on
                  ? "bg-ink text-snow-off-glacier border-ink"
                  : "bg-card text-ink-soft border-line hover:text-ink"
              }`}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: l.dot }}
              />
              {l.label}
            </button>
          ))}
          {loading && (
            <span className="bg-card border border-line rounded-pill px-4 py-2 text-[13px] font-medium text-ink-soft shadow-sm">
              Loading the map…
            </span>
          )}
        </div>

        {/* Selected pin card */}
        {selected && (
          <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:w-[360px] z-10 card-base p-5 shadow-[0_24px_64px_-16px_rgba(20,30,60,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">
                  {selected.kind === "stay" ? "Stay" : "Event"}
                </p>
                <p className="text-ink text-[16px] font-semibold mt-0.5">
                  {selected.title}
                </p>
                <p className="text-ink-soft text-[13px] mt-1 truncate">
                  {selected.subtitle}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelected(null)}
                className="text-ink-faint hover:text-ink transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (inCart) {
                    removeItem(selected.id);
                    return;
                  }
                  addItem({
                    id: selected.id,
                    type: selected.kind === "stay" ? "hotel" : "event",
                    title: selected.title,
                    subtitle:
                      selected.kind === "event" && travelers > 1
                        ? `${selected.subtitle} · ${travelers} tickets`
                        : selected.subtitle,
                    price: selected.cartPrice,
                    image: selected.image,
                    bookingUrl: selected.bookingUrl,
                    provider: selected.provider,
                    date: selected.date,
                    meta: selected.meta,
                  });
                }}
                className={`flex-1 rounded-pill py-2.5 text-[13px] font-bold transition-colors ${
                  inCart
                    ? "bg-raised-slate text-ink hover:bg-hover-slate"
                    : "bg-accent text-white hover:bg-accent-light"
                }`}
              >
                {inCart
                  ? "Remove from trip"
                  : `Add to trip${selected.cartPrice ? ` · $${selected.cartPrice.toLocaleString()}` : ""}`}
              </button>
              <Link
                href="/trip"
                className="rounded-pill border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-soft hover:text-ink transition-colors"
              >
                View trip
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="shrink-0 border-b border-line bg-card">
      <div className="max-w-content mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/walter-logo.png" alt="" className="w-7 h-7 rounded-[8px]" />
          <span className="text-ink text-[16px] font-semibold tracking-tight">
            Walter
          </span>
        </Link>
        <nav className="flex items-center gap-5" aria-label="Map">
          <Link
            href="/results"
            className="text-ink-soft hover:text-ink text-[13px] font-medium transition-colors"
          >
            Back to results
          </Link>
          <Link
            href="/trip"
            className="text-ink-soft hover:text-ink text-[13px] font-medium transition-colors"
          >
            Your trip
          </Link>
        </nav>
      </div>
    </header>
  );
}
