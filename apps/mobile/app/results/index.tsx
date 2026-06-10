import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { SegmentedControl } from "../../components/SegmentedControl";
import { SkeletonListItem } from "../../components/Skeleton";
import { api } from "../../lib/apiClient";
import { useTripCart } from "../../lib/stores/tripCartStore";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

type Section = "flights" | "stay" | "events" | "do";

export default function ResultsScreen() {
  const prefs = usePrefs((s) => s.prefs);
  const cart = useTripCart();
  const [section, setSection] = useState<Section>("flights");

  const flights = useQuery({
    queryKey: ["flights", prefs],
    queryFn: () =>
      api.flights.search({
        origin: prefs.departureAirportCode ?? prefs.departureCity ?? "",
        destination: prefs.destination ?? "",
        departDate: prefs.startDate ?? "",
        returnDate: prefs.endDate ?? "",
        adults: prefs.travelers ?? 2,
      }),
    enabled: !!prefs.destination && !!prefs.startDate && !!prefs.endDate,
  });

  const hotels = useQuery({
    queryKey: ["hotels", prefs],
    queryFn: () =>
      api.hotels.search({
        destination: prefs.destination ?? "",
        checkIn: prefs.startDate ?? "",
        checkOut: prefs.endDate ?? "",
        adults: prefs.travelers ?? 2,
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
      }),
    enabled: section === "do",
  });

  const itemCount = cart.items.length;

  const content = useMemo(() => {
    if (section === "flights") {
      if (flights.isLoading) return <Loading label="Searching flights…" />;
      const f = flights.data?.flights ?? [];
      if (!f.length) return <Empty icon="airplane" label="No flights found." />;
      return f.map((flight) => (
        <ListItem
          key={flight.id}
          title={`${flight.airline} ${flight.flightNumber}`}
          subtitle={`${flight.departureCity} → ${flight.arrivalCity} · ${flight.duration} · ${flight.stops} stops`}
          price={flight.price}
          inCart={cart.has(flight.id)}
          onAdd={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: flight.id,
              type: "flight",
              title: `${flight.airline} ${flight.flightNumber}`,
              subtitle: `${flight.departureCity} → ${flight.arrivalCity}`,
              price: flight.price,
            });
          }}
        />
      ));
    }
    if (section === "stay") {
      if (hotels.isLoading) return <Loading label="Searching hotels…" />;
      const h = hotels.data?.hotels ?? [];
      if (!h.length) return <Empty icon="bed.double" label="No hotels found." />;
      return h.map((hotel) => (
        <ListItem
          key={hotel.id}
          title={hotel.name}
          subtitle={`${hotel.rating.toFixed(1)} · ${hotel.reviewCount.toLocaleString()} reviews`}
          price={hotel.totalPrice}
          inCart={cart.has(hotel.id)}
          onAdd={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: hotel.id,
              type: "hotel",
              title: hotel.name,
              subtitle: hotel.address,
              price: hotel.totalPrice,
            });
          }}
        />
      ));
    }
    if (section === "events") {
      if (events.isLoading) return <Loading label="Searching events…" />;
      const all = [
        ...(events.data?.exactMatches ?? []),
        ...(events.data?.similarMatches ?? []),
        ...(events.data?.topInArea ?? []),
      ];
      if (!all.length) return <Empty icon="ticket" label="No events found." />;
      return all.map((e) => (
        <ListItem
          key={e.id}
          title={e.name}
          subtitle={`${e.venueName} · ${e.date}`}
          price={e.priceMin ?? 0}
          inCart={cart.has(e.id)}
          onAdd={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: e.id,
              type: "event",
              title: e.name,
              subtitle: e.venueName,
              price: e.priceMin ?? 0,
              image: e.image,
            });
          }}
        />
      ));
    }
    if (section === "do") {
      if (suggestions.isLoading)
        return <Loading label="Walter is thinking…" />;
      const s = suggestions.data?.suggestions ?? [];
      if (!s.length)
        return <Empty icon="lightbulb" label="No suggestions yet." />;
      return s.map((sug) => (
        <ListItem
          key={sug.id}
          title={sug.title}
          subtitle={`${sug.locationName} · ${sug.bestTime}`}
          price={sug.estimatedCost ?? 0}
          inCart={cart.has(sug.id)}
          onAdd={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            cart.add({
              id: sug.id,
              type: sug.type,
              title: sug.title,
              subtitle: sug.locationName,
              price: sug.estimatedCost ?? 0,
            });
          }}
        />
      ));
    }
    return null;
  }, [section, flights, hotels, events, suggestions, cart]);

  return (
    <View className="flex-1 bg-page-bg">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
      >
        <SegmentedControl<Section>
          options={[
            { value: "flights", label: "Flights" },
            { value: "stay", label: "Stay" },
            { value: "events", label: "Events" },
            { value: "do", label: "Do" },
          ]}
          value={section}
          onChange={setSection}
        />

        <View className="mt-4">{content}</View>
      </ScrollView>

      {itemCount > 0 ? (
        <View
          className="absolute left-4 right-4 bottom-28"
          style={{
            shadowColor: colors.shadow,
            shadowOpacity: 0.12,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <Pressable
            onPress={() => router.push("/trip")}
            className="rounded-full px-5 py-4 flex-row items-center justify-between"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-white text-[15px] font-semibold">
              View {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
            <SymbolView
              name="arrow.right"
              tintColor="white"
              size={16}
              fallback={null}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <View>
      <Text className="text-ink-soft text-[12px] mb-3 mt-1">{label}</Text>
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

function ListItem({
  title,
  subtitle,
  price,
  inCart,
  onAdd,
}: {
  title: string;
  subtitle: string;
  price: number;
  inCart: boolean;
  onAdd: () => void;
}) {
  return (
    <View className="bg-card rounded-2xl p-4 mb-3 border border-line">
      <Text className="text-ink text-[15px] font-semibold" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-ink-soft text-[12px] mt-1" numberOfLines={2}>
        {subtitle}
      </Text>
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-ink text-[16px] font-bold">
          ${price.toLocaleString()}
        </Text>
        <Pressable
          onPress={onAdd}
          disabled={inCart}
          className="px-4 py-2 rounded-full flex-row items-center gap-1.5"
          style={{
            backgroundColor: inCart ? colors.surface2 : colors.accent,
          }}
        >
          <SymbolView
            name={inCart ? "checkmark" : "plus"}
            tintColor={inCart ? colors.textSecondary : "white"}
            size={12}
            fallback={null}
          />
          <Text
            className="text-[13px] font-semibold"
            style={{ color: inCart ? colors.textSecondary : "white" }}
          >
            {inCart ? "Added" : "Add"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
