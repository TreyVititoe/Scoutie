"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapItem = {
  title: string;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
};

type ResolvedItem = {
  title: string;
  locationName: string;
  lat: number;
  lng: number;
};

type TripMapProps = {
  items: MapItem[];
  destination?: string;
};

/**
 * Geocode a location name via Mapbox to get coordinates.
 */
async function geocode(query: string, token: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data.features?.[0]?.center;
    if (!coords) return null;
    return { lng: coords[0], lat: coords[1] };
  } catch {
    return null;
  }
}

export default function TripMap({ items, destination }: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [resolved, setResolved] = useState<ResolvedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Geocode items that don't have coordinates
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || items.length === 0) {
      setLoading(false);
      return;
    }

    async function resolveLocations() {
      const results: ResolvedItem[] = [];
      const seen = new Set<string>();

      for (const item of items) {
        // Skip duplicates
        const key = item.locationName?.toLowerCase() || item.title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        if (item.locationLat != null && item.locationLng != null) {
          results.push({
            title: item.title,
            locationName: item.locationName,
            lat: item.locationLat,
            lng: item.locationLng,
          });
        } else if (item.locationName) {
          // Geocode using location name + destination for context
          const query = destination
            ? `${item.locationName}, ${destination}`
            : item.locationName;
          const coords = await geocode(query, token!);
          if (coords) {
            results.push({
              title: item.title,
              locationName: item.locationName,
              lat: coords.lat,
              lng: coords.lng,
            });
          }
        }
      }

      setResolved(results);
      setLoading(false);
    }

    resolveLocations();
  }, [items, destination]);

  // Render map when resolved items are ready
  useEffect(() => {
    if (!mapContainerRef.current || resolved.length === 0) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [resolved[0].lng, resolved[0].lat],
      zoom: 12,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const bounds = new mapboxgl.LngLatBounds();

    resolved.forEach((item) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
        `<div style="font-family: system-ui, sans-serif; padding: 2px 4px;">
          <p style="font-weight: 700; font-size: 13px; margin: 0; color: #006571;">${item.title}</p>
          <p style="font-size: 11px; margin: 2px 0 0; color: #595c5d;">${item.locationName}</p>
        </div>`
      );

      new mapboxgl.Marker({ color: "#006571" })
        .setLngLat([item.lng, item.lat])
        .setPopup(popup)
        .addTo(map);

      bounds.extend([item.lng, item.lat]);
    });

    if (resolved.length > 1) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [resolved]);

  if (loading) {
    return (
      <div className="card-base p-6 flex items-center justify-center h-80 lg:min-h-[400px] text-on-light-secondary text-sm animate-pulse">
        Loading map...
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="card-base p-6 flex items-center justify-center h-64 text-on-light-secondary text-sm">
        Map locations will appear here
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="card-base p-6 overflow-hidden h-80 lg:h-full lg:min-h-[400px] w-full"
    />
  );
}
