"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapItem = {
  title: string;
  locationName: string;
  locationLat: number;
  locationLng: number;
};

type TripMapProps = {
  items: MapItem[];
};

export default function TripMap({ items }: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (items.length === 0) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("[TripMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [items[0].locationLng, items[0].locationLat],
      zoom: 12,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const bounds = new mapboxgl.LngLatBounds();

    items.forEach((item) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
        `<div style="font-family: system-ui, sans-serif; padding: 2px 4px;">
          <p style="font-weight: 600; font-size: 13px; margin: 0;">${item.title}</p>
          <p style="font-size: 11px; margin: 2px 0 0; color: #666;">${item.locationName}</p>
        </div>`
      );

      new mapboxgl.Marker({ color: "#6366f1" })
        .setLngLat([item.locationLng, item.locationLat])
        .setPopup(popup)
        .addTo(map);

      bounds.extend([item.locationLng, item.locationLat]);
    });

    if (items.length > 1) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface flex items-center justify-center h-64 text-text-muted text-sm">
        Map locations will appear here
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="rounded-2xl border border-border overflow-hidden h-80 lg:h-full lg:min-h-[400px] w-full"
    />
  );
}
