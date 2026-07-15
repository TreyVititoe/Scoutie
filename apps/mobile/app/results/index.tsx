import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Image } from "expo-image";
import { PlaneLoader } from "../../components/PlaneLoader";
import {
  EventCard,
  FlightCard,
  HotelCard,
  SuggestionCard,
} from "../../components/results/ResultCards";
import { AirportAutocomplete } from "../../components/AirportAutocomplete";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SkeletonListItem } from "../../components/Skeleton";
import { api } from "../../lib/apiClient";
import { useTripCart } from "../../lib/stores/tripCartStore";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

type Section = "flights" | "stay" | "events" | "do";

const STAY_TYPES = [
  { id: "hotel", label: "Hotels" },
  { id: "vacation_rental", label: "Vacation Rentals" },
  { id: "hostel", label: "Hostels" },
] as const;
type StayType = (typeof STAY_TYPES)[number]["id"];

export default function ResultsScreen() {
  const prefs = usePrefs((s) => s.prefs);
  const cart = useTripCart();
  const [section, setSection] = useState<Section>("flights");
  const [stayType, setStayType] = useState<StayType>("hotel");
  const destPhoto = prefs.destination ? api.photo.url(prefs.destination) : undefined;

  const hasOrigin = !!(prefs.departureAirportCode || prefs.departureCity);
  const flights = useQuery({
    queryKey: ["flights", prefs],
    queryFn: () =>
      api.flights.search({
        origin: prefs.departureAirportCode || prefs.departureCity || "",
        destination: prefs.destination ?? "",
        departDate: prefs.startDate ?? "",
        returnDate: prefs.endDate ?? "",
        adults: prefs.travelers ?? 2,
      }),
    enabled: hasOrigin && !!prefs.destination && !!prefs.startDate && !!prefs.endDate,
  });

  const hotels = useQuery({
    queryKey: ["hotels", prefs, stayType],
    queryFn: () =>
      api.hotels.search({
        destination: prefs.destination ?? "",
        checkIn: prefs.startDate ?? "",
        checkOut: prefs.endDate ?? "",
        adults: prefs.travelers ?? 2,
        stayType,
      }),
    enabled: section === "stay" || !!prefs.destination,
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
    enabled: section === "events" || !!prefs.destination,
  });

  const suggestions = useQuery({
    queryKey: ["suggestions", prefs],
    queryFn: () =>
      api.suggestions.generate({
        destination: prefs.destination ?? "",
        startDate: prefs.startDate ?? "",
        endDate: prefs.endDate ?? "",
        interests: prefs.vibes ?? [],
        travelers: prefs.travelers ?? 2,
        travelerType: prefs.travelersType ?? "couple",
        description: prefs.description ?? "",
      }),
    enabled: section === "do",
  });

  const itemCount = cart.items.length;

  const content = useMemo(() => {
    if (section === "flights") {
      if (!hasOrigin)
        return (
          <DeparturePrompt
            onSubmit={(entry) => {
              const isCode = /^[a-zA-Z]{3}$/.test(entry.trim());
              usePrefs.getState().patch({
                departureCity: entry,
                departureAirportCode: isCode
                  ? entry.trim().toUpperCase()
                  : undefined,
              });
            }}
          />
        );
      if (flights.isLoading) return <Loading label="Searching flights…" photo={destPhoto} />;
      const f = flights.data?.flights ?? [];
      if (!f.length) return <Empty icon="airplane" label="No flights found." />;
      const cheapest = f.reduce((a, b) => (a.price < b.price ? a : b));
      const ordered = [...f].sort((a, b) =>
        a.id === cheapest.id ? -1 : b.id === cheapest.id ? 1 : 0
      );
      return ordered.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          cheapest={flight.id === cheapest.id}
          added={cart.has(flight.id)}
          onToggle={() => {
            if (cart.has(flight.id)) return cart.remove(flight.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: flight.id,
              type: "flight",
              title: `${flight.airline} ${flight.outbound.departure}, ${flight.outbound.arrival}`,
              subtitle: flight.return
                ? `${flight.outbound.duration} out | ${flight.return.duration} back | roundtrip`
                : `${flight.outbound.departTime} | ${flight.outbound.duration}`,
              price: flight.price,
              bookingUrl: flight.bookingUrl ?? null,
              provider: "Google Flights",
            });
          }}
        />
      ));
    }
    if (section === "stay") {
      const pills = (
        <View className="flex-row gap-2 mb-4 flex-wrap">
          {STAY_TYPES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setStayType(t.id)}
              className="px-3.5 py-2 rounded-full border"
              style={{
                backgroundColor: stayType === t.id ? colors.text : "transparent",
                borderColor:
                  stayType === t.id ? colors.text : colors.hairlineStrong,
              }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: stayType === t.id ? "white" : colors.textSecondary }}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      );
      if (hotels.isLoading)
        return (
          <View>
            {pills}
            <Loading label="Searching stays…" photo={destPhoto} />
          </View>
        );
      const h = hotels.data?.hotels ?? [];
      const bestValue = h.length
        ? h.reduce((a, b) =>
            a.rating / (a.pricePerNight || 1) > b.rating / (b.pricePerNight || 1)
              ? a
              : b
          )
        : null;
      return (
        <View>
          {pills}
          {!h.length ? (
            <Empty icon="bed.double" label="No stays found for this type." />
          ) : (
            [...h]
              .sort((a, b) =>
                a.id === bestValue?.id ? -1 : b.id === bestValue?.id ? 1 : 0
              )
              .map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                bestValue={hotel.id === bestValue?.id}
                added={cart.has(hotel.id)}
                onToggle={() => {
                  if (cart.has(hotel.id)) return cart.remove(hotel.id);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  cart.add({
                    id: hotel.id,
                    type: "hotel",
                    title: hotel.name,
                    subtitle: hotel.address,
                    price: hotel.totalPrice,
                    image: hotel.image,
                    bookingUrl: hotel.bookingUrl ?? null,
                    provider: "Booking.com",
                  });
                }}
              />
            ))
          )}
        </View>
      );
    }
    if (section === "events") {
      if (events.isLoading) return <Loading label="Searching events…" photo={destPhoto} />;
      const all = [
        ...(events.data?.exactMatches ?? []),
        ...(events.data?.similarMatches ?? []),
        ...(events.data?.topInArea ?? []),
      ];
      if (!all.length) return <Empty icon="ticket" label="No events found." />;
      const exactCount = events.data?.exactMatches?.length ?? 0;
      return all.map((e, i) => (
        <EventCard
          key={e.id}
          event={e}
          featured={i === 0 && exactCount > 0}
          added={cart.has(e.id)}
          onToggle={() => {
            if (cart.has(e.id)) return cart.remove(e.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: e.id,
              type: "event",
              title: e.name,
              subtitle: e.venueName,
              price: e.priceMin ?? 0,
              image: e.image,
              bookingUrl: e.url ?? null,
              provider: "Ticketmaster",
              meta: { venueLat: e.venueLat ?? null, venueLng: e.venueLng ?? null },
            });
          }}
        />
      ));
    }
    if (section === "do") {
      if (suggestions.isLoading)
        return <Loading label="Walter is thinking…" photo={destPhoto} />;
      const s = suggestions.data?.suggestions ?? [];
      if (!s.length)
        return <Empty icon="lightbulb" label="No suggestions yet." />;
      return s.map((sug) => (
        <SuggestionCard
          key={sug.id}
          suggestion={sug}
          added={cart.has(sug.id)}
          onToggle={() => {
            if (cart.has(sug.id)) return cart.remove(sug.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: sug.id,
              type: sug.type,
              title: sug.title,
              subtitle: sug.locationName,
              price: sug.estimatedCost ?? 0,
              bookingUrl: `https://www.google.com/search?q=${encodeURIComponent(
                sug.bookingSearchQuery || `${sug.title} ${sug.locationName}`
              )}`,
              provider: "the web",
            });
          }}
        />
      ));
    }
    return null;
  }, [section, flights, hotels, events, suggestions, cart, stayType, hasOrigin, destPhoto]);

  return (
    <View className="flex-1 bg-page-bg">
      <Stack.Screen
        options={{
          headerRight: () =>
            itemCount > 0 ? (
              <Pressable
                onPress={() => router.push("/trip")}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: colors.accent }}
              >
                <Text className="text-white text-[13px] font-semibold">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Text>
                <SymbolView
                  name="arrow.right"
                  tintColor="white"
                  size={11}
                  fallback={null}
                />
              </Pressable>
            ) : null,
        }}
      />
      {prefs.destination ? (
        <View className="px-4 pt-2 pb-3 bg-page-bg border-b" style={{ borderBottomColor: colors.hairline }}>
          <Text
            className="text-ink font-semibold"
            style={{ fontSize: 26, lineHeight: 29, letterSpacing: -0.3 }}
            numberOfLines={1}
          >
            {prefs.destination.split(",")[0]}
          </Text>
          {prefs.startDate && prefs.endDate ? (
            <Text className="text-ink-faint text-[13px] mt-1">
              {new Date(prefs.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" to "}
              {new Date(prefs.endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" · "}
              {prefs.travelers ?? 2} travelers
            </Text>
          ) : null}
        </View>
      ) : null}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
      >
        <SegmentedControl<Section>
          options={[
            { value: "flights", label: "Flights" },
            { value: "stay", label: "Stay" },
            { value: "events", label: "Events" },
            { value: "do", label: "Picks" },
          ]}
          value={section}
          onChange={setSection}
        />

        <View className="mt-4">{content}</View>
      </ScrollView>

    </View>
  );
}

function DeparturePrompt({ onSubmit }: { onSubmit: (city: string) => void }) {
  const [value, setValue] = useState("");
  const ready = value.trim().length >= 2;
  return (
    <View className="bg-card rounded-2xl p-5 border border-line">
      <Text className="text-ink text-[16px] font-semibold">
        Where are you flying from?
      </Text>
      <Text className="text-ink-faint text-[12px] mt-1 mb-3 leading-4">
        A city or a 3-letter airport code. Walter searches real fares from
        there.
      </Text>
      <AirportAutocomplete value={value} onChange={setValue} />
      <Pressable
        disabled={!ready}
        onPress={() => onSubmit(value.trim())}
        className="mt-3 py-3 rounded-full items-center"
        style={{ backgroundColor: ready ? colors.accent : colors.surface2 }}
      >
        <Text
          className="text-[14px] font-semibold"
          style={{ color: ready ? "white" : colors.textTertiary }}
        >
          Search flights
        </Text>
      </Pressable>
    </View>
  );
}

function Loading({ label, photo }: { label: string; photo?: string }) {
  return (
    <View className="rounded-3xl overflow-hidden">
      {photo ? (
        <Image
          source={{ uri: photo }}
          contentFit="cover"
          style={{ position: "absolute", inset: 0, opacity: 0.07 }}
        />
      ) : null}
      <View className="items-center py-5">
        <PlaneLoader />
      </View>
      <Text className="text-ink-soft text-[12px] mb-3 text-center">{label}</Text>
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
    </View>
  );
}

function Empty({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="items-center py-16">
      <SymbolView
        name={icon as never}
        tintColor={colors.textTertiary}
        size={32}
        fallback={null}
      />
      <Text className="text-ink-soft text-[13px] mt-3">{label}</Text>
    </View>
  );
}

