import Mapbox from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "../../lib/apiClient";
import { useTripCart } from "../../lib/stores/tripCartStore";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

/* The trip on a map: every stay and event for the current plan as a pin.
 * Tap a pin for the card; add it to the cart right there. */

type PinKind = "stay" | "event";

type Pin = {
  id: string;
  kind: PinKind;
  title: string;
  subtitle: string;
  price: number;
  cartPrice: number;
  lat: number;
  lng: number;
  bookingUrl: string | null;
  image: string | null;
  provider: string;
};

const EVENT_PIN = "#1F2733";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const prefs = usePrefs((s) => s.prefs);
  const cart = useTripCart();
  const [showStays, setShowStays] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const travelers = prefs.travelers ?? 2;
  const ready = !!(prefs.destination && prefs.startDate && prefs.endDate);

  const center = useQuery({
    queryKey: ["map-center", prefs.destination],
    queryFn: async (): Promise<[number, number] | null> => {
      const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
      if (!token) return null;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          prefs.destination ?? ""
        )}.json?types=place&limit=1&access_token=${token}`
      );
      const data = await res.json();
      const c = data?.features?.[0]?.center;
      return Array.isArray(c) && c.length === 2 ? [c[0], c[1]] : null;
    },
    enabled: !!prefs.destination,
    staleTime: Infinity,
  });

  const hotels = useQuery({
    queryKey: ["hotels", prefs, "hotel"],
    queryFn: () =>
      api.hotels.search({
        destination: prefs.destination ?? "",
        checkIn: prefs.startDate ?? "",
        checkOut: prefs.endDate ?? "",
        adults: travelers,
        stayType: "hotel",
      }),
    enabled: ready,
  });

  const events = useQuery({
    queryKey: ["events", prefs],
    queryFn: () =>
      api.events.search({
        destination: prefs.destination ?? "",
        startDate: prefs.startDate ?? "",
        endDate: prefs.endDate ?? "",
        vibes: prefs.vibes ?? [],
        description: prefs.description ?? "",
      }),
    enabled: ready,
  });

  const pins = useMemo<Pin[]>(() => {
    const out: Pin[] = [];
    if (showStays) {
      for (const h of hotels.data?.hotels ?? []) {
        if (h.latitude == null || h.longitude == null) continue;
        out.push({
          id: h.id,
          kind: "stay",
          title: h.name,
          subtitle:
            h.rating > 0 ? `${h.rating}/10 · $${h.pricePerNight}/night` : `$${h.pricePerNight}/night`,
          price: h.totalPrice,
          cartPrice: h.totalPrice,
          lat: h.latitude,
          lng: h.longitude,
          bookingUrl: h.bookingUrl ?? null,
          image: h.image ?? null,
          provider: "Booking.com",
        });
      }
    }
    if (showEvents) {
      const all = [
        ...(events.data?.exactMatches ?? []),
        ...(events.data?.similarMatches ?? []),
        ...(events.data?.topInArea ?? []),
      ];
      for (const e of all) {
        if (e.venueLat == null || e.venueLng == null) continue;
        out.push({
          id: e.id,
          kind: "event",
          title: e.name,
          subtitle: `${e.venueName}${e.priceMin != null ? ` · from $${e.priceMin}` : ""}`,
          price: e.priceMin ?? 0,
          cartPrice: (e.priceMin ?? 0) * travelers,
          lat: e.venueLat,
          lng: e.venueLng,
          bookingUrl: e.url ?? null,
          image: e.image ?? null,
          provider: "Ticketmaster",
        });
      }
    }
    return out;
  }, [hotels.data, events.data, showStays, showEvents, travelers]);

  const selected = pins.find((p) => p.id === selectedId) ?? null;
  const loading = ready && (hotels.isLoading || events.isLoading || center.isLoading);

  if (!ready) {
    return (
      <View
        className="flex-1 bg-page-bg items-center justify-center px-8"
        style={{ paddingBottom: insets.bottom + 90 }}
      >
        <SymbolView name="map" tintColor={colors.textTertiary} size={34} fallback={null} />
        <Text className="text-ink text-[17px] font-semibold mt-4 text-center">
          The map needs a trip first
        </Text>
        <Text className="text-ink-soft text-[13px] mt-2 text-center leading-5">
          Pick a destination and dates, then come back to see every stay and
          event on the map.
        </Text>
        <Pressable
          onPress={() => router.push("/search")}
          accessibilityRole="button"
          className="mt-5 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white text-[14px] font-semibold">Start a trip</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-page-bg">
      <Mapbox.MapView
        styleURL={Mapbox.StyleURL.Light}
        style={{ flex: 1 }}
        scaleBarEnabled={false}
        onPress={() => setSelectedId(null)}
      >
        {center.data ? (
          <Mapbox.Camera
            zoomLevel={11.5}
            centerCoordinate={center.data}
            animationMode="flyTo"
            animationDuration={800}
          />
        ) : null}
        {pins.map((p) => {
          const active = p.id === selectedId;
          const inCart = cart.has(p.id);
          return (
            <Mapbox.MarkerView
              key={`${p.kind}-${p.id}`}
              coordinate={[p.lng, p.lat]}
              allowOverlap
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedId(p.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${p.kind === "stay" ? "Stay" : "Event"}: ${p.title}`}
                className="items-center justify-center rounded-full border-2"
                style={{
                  width: active ? 34 : 28,
                  height: active ? 34 : 28,
                  backgroundColor: p.kind === "stay" ? colors.accent : EVENT_PIN,
                  borderColor: inCart ? "#FFD166" : "white",
                  shadowColor: "#000",
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <SymbolView
                  name={p.kind === "stay" ? "bed.double.fill" : "ticket.fill"}
                  tintColor="white"
                  size={active ? 15 : 12}
                  fallback={null}
                />
              </Pressable>
            </Mapbox.MarkerView>
          );
        })}
      </Mapbox.MapView>

      {/* Layer toggles */}
      <View
        className="absolute left-4 right-4 flex-row gap-2"
        style={{ top: insets.top + 8 }}
      >
        {(
          [
            { key: "stay", label: "Stays", on: showStays, set: setShowStays },
            { key: "event", label: "Events", on: showEvents, set: setShowEvents },
          ] as const
        ).map((l) => (
          <Pressable
            key={l.key}
            onPress={() => l.set(!l.on)}
            accessibilityRole="button"
            accessibilityState={{ selected: l.on }}
            className="px-4 py-2 rounded-full border"
            style={{
              backgroundColor: l.on ? colors.text : "rgba(255,255,255,0.92)",
              borderColor: l.on ? colors.text : colors.hairlineStrong,
            }}
          >
            <Text
              className="text-[13px] font-semibold"
              style={{ color: l.on ? "white" : colors.textSecondary }}
            >
              {l.label}
            </Text>
          </Pressable>
        ))}
        {loading ? (
          <View
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
          >
            <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
              Loading the map…
            </Text>
          </View>
        ) : null}
      </View>

      {/* Selected pin card, floating above the tab bar */}
      {selected ? (
        <View
          className="absolute left-4 right-4 bg-card rounded-2xl border border-line p-4"
          style={{
            bottom: insets.bottom + 90,
            shadowColor: colors.shadow,
            shadowOpacity: 0.22,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-ink-faint text-[10px] font-bold uppercase tracking-widest">
                {selected.kind === "stay" ? "Stay" : "Event"}
              </Text>
              <Text className="text-ink text-[15px] font-semibold mt-0.5" numberOfLines={2}>
                {selected.title}
              </Text>
              <Text className="text-ink-soft text-[12px] mt-1" numberOfLines={1}>
                {selected.subtitle}
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedId(null)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="p-1"
            >
              <SymbolView name="xmark" tintColor={colors.textTertiary} size={14} fallback={null} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              if (cart.has(selected.id)) {
                cart.remove(selected.id);
                return;
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              cart.add({
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
                meta:
                  selected.kind === "event"
                    ? { venueLat: selected.lat, venueLng: selected.lng }
                    : undefined,
              });
            }}
            accessibilityRole="button"
            className="mt-3 py-3 rounded-full items-center"
            style={{
              backgroundColor: cart.has(selected.id) ? colors.surface2 : colors.accent,
            }}
          >
            <Text
              className="text-[14px] font-semibold"
              style={{ color: cart.has(selected.id) ? colors.text : "white" }}
            >
              {cart.has(selected.id)
                ? "Remove from trip"
                : `Add to trip${selected.cartPrice > 0 ? ` · $${selected.cartPrice.toLocaleString()}` : ""}`}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
