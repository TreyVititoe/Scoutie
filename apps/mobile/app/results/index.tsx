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
import { DateRangePicker } from "../../components/DateRangePicker";
import {
  ChipRow,
  FilterPanel,
  MultiChipRow,
} from "../../components/results/FilterChips";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SkeletonListItem } from "../../components/Skeleton";
import { api } from "../../lib/apiClient";
import {
  airlinesIn,
  applyEventFilters,
  applyFlightFilters,
  applyHotelFilters,
  applyPickFilters,
  countActive,
  defaultEventFilters,
  defaultFlightFilters,
  defaultHotelFilters,
  defaultPickFilters,
  eventCategories,
  type EventFilters,
  type FlightFilters,
  type HotelFilters,
  type PickFilters,
} from "../../lib/resultsFilters";
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
  const [flightF, setFlightF] = useState<FlightFilters>(defaultFlightFilters);
  const [hotelF, setHotelF] = useState<HotelFilters>(defaultHotelFilters);
  const [eventF, setEventF] = useState<EventFilters>(defaultEventFilters);
  const [pickF, setPickF] = useState<PickFilters>(defaultPickFilters);
  const destPhoto = prefs.destination ? api.photo.url(prefs.destination) : undefined;

  const travelers = prefs.travelers ?? 2;
  const hasOrigin = !!(prefs.departureAirportCode || prefs.departureCity);
  /* Quick and Compare can land here dateless; every search needs dates, so
   * the screen prompts inline and holds the queries until they exist. */
  const hasDates = !!(prefs.startDate && prefs.endDate);
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
    enabled: hasOrigin && !!prefs.destination && hasDates,
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
    enabled: (section === "stay" || !!prefs.destination) && hasDates,
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
    enabled: (section === "events" || !!prefs.destination) && hasDates,
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
    enabled: section === "do" && hasDates,
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
      if (flights.isPaused)
        return <ErrorCard what="flight" offline onRetry={() => flights.refetch()} />;
      if (flights.isError)
        return (
          <ErrorCard
            what="flight"
            message={errText(flights.error)}
            onRetry={() => flights.refetch()}
            retrying={flights.isRefetching}
          />
        );
      if (flights.isLoading) return <Loading label="Searching flights…" photo={destPhoto} />;
      const fAll = flights.data?.flights ?? [];
      if (!fAll.length) return <Empty icon="airplane" label="No flights found." />;
      const f = applyFlightFilters(fAll, flightF);
      const flightPanel = (
        <FilterPanel
          activeCount={countActive(flightF, defaultFlightFilters)}
          onReset={() => setFlightF(defaultFlightFilters)}
        >
          <ChipRow
            label="Stops"
            value={flightF.stops}
            onChange={(v) => setFlightF({ ...flightF, stops: v })}
            options={[
              { value: "any", label: "Any" },
              { value: "nonstop", label: "Nonstop" },
              { value: "one", label: "1 stop max" },
            ]}
          />
          <ChipRow
            label="Price"
            value={flightF.maxPrice}
            onChange={(v) => setFlightF({ ...flightF, maxPrice: v })}
            options={[
              { value: null, label: "Any" },
              { value: 300, label: "Under $300" },
              { value: 600, label: "Under $600" },
              { value: 1000, label: "Under $1,000" },
            ]}
          />
          <MultiChipRow
            label="Airline"
            options={airlinesIn(fAll)}
            values={flightF.airlines}
            onToggle={(a) =>
              setFlightF({
                ...flightF,
                airlines: flightF.airlines.includes(a)
                  ? flightF.airlines.filter((x) => x !== a)
                  : [...flightF.airlines, a],
              })
            }
          />
          <ChipRow
            label="Sort"
            value={flightF.sort}
            onChange={(v) => setFlightF({ ...flightF, sort: v })}
            options={[
              { value: "best", label: "Best" },
              { value: "cheapest", label: "Cheapest" },
              { value: "fastest", label: "Fastest" },
            ]}
          />
        </FilterPanel>
      );
      if (!f.length)
        return (
          <View>
            {flightPanel}
            <Empty icon="airplane" label="No flights match these filters." />
          </View>
        );
      const cheapest = f.reduce((a, b) => (a.price < b.price ? a : b));
      const ordered =
        flightF.sort === "best"
          ? [...f].sort((a, b) =>
              a.id === cheapest.id ? -1 : b.id === cheapest.id ? 1 : 0
            )
          : f;
      return (
        <View>
          {flightPanel}
          {ordered.map((flight) => (
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
          ))}
        </View>
      );
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
      if (hotels.isPaused)
        return (
          <View>
            {pills}
            <ErrorCard what="stay" offline onRetry={() => hotels.refetch()} />
          </View>
        );
      if (hotels.isError)
        return (
          <View>
            {pills}
            <ErrorCard
              what="stay"
              message={errText(hotels.error)}
              onRetry={() => hotels.refetch()}
              retrying={hotels.isRefetching}
            />
          </View>
        );
      if (hotels.isLoading)
        return (
          <View>
            {pills}
            <Loading label="Searching stays…" photo={destPhoto} />
          </View>
        );
      const hAll = hotels.data?.hotels ?? [];
      const h = applyHotelFilters(hAll, hotelF);
      const hotelPanel = hAll.length ? (
        <FilterPanel
          activeCount={countActive(hotelF, defaultHotelFilters)}
          onReset={() => setHotelF(defaultHotelFilters)}
        >
          <ChipRow
            label="Per night"
            value={hotelF.maxNight}
            onChange={(v) => setHotelF({ ...hotelF, maxNight: v })}
            options={[
              { value: null, label: "Any" },
              { value: 100, label: "Under $100" },
              { value: 200, label: "Under $200" },
              { value: 400, label: "Under $400" },
            ]}
          />
          <ChipRow
            label="Rating"
            value={hotelF.minRating}
            onChange={(v) => setHotelF({ ...hotelF, minRating: v })}
            options={[
              { value: null, label: "Any" },
              { value: 7, label: "7+" },
              { value: 8, label: "8+" },
              { value: 9, label: "9+" },
            ]}
          />
          <ChipRow
            label="Sort"
            value={hotelF.sort}
            onChange={(v) => setHotelF({ ...hotelF, sort: v })}
            options={[
              { value: "value", label: "Best value" },
              { value: "cheapest", label: "Cheapest" },
              { value: "rating", label: "Top rated" },
            ]}
          />
        </FilterPanel>
      ) : null;
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
          {hotelPanel}
          {!h.length ? (
            <Empty
              icon="bed.double"
              label={
                hAll.length
                  ? "No stays match these filters."
                  : "No stays found for this type."
              }
            />
          ) : (
            (hotelF.sort === "value"
              ? [...h].sort((a, b) =>
                  a.id === bestValue?.id ? -1 : b.id === bestValue?.id ? 1 : 0
                )
              : h
            ).map((hotel) => (
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
      if (events.isPaused)
        return <ErrorCard what="event" offline onRetry={() => events.refetch()} />;
      if (events.isError)
        return (
          <ErrorCard
            what="event"
            message={errText(events.error)}
            onRetry={() => events.refetch()}
            retrying={events.isRefetching}
          />
        );
      if (events.isLoading) return <Loading label="Searching events…" photo={destPhoto} />;
      const all = [
        ...(events.data?.exactMatches ?? []),
        ...(events.data?.similarMatches ?? []),
        ...(events.data?.topInArea ?? []),
      ];
      if (!all.length) return <Empty icon="ticket" label="No events found." />;
      const shown = applyEventFilters(all, eventF);
      const eventPanel = (
        <FilterPanel
          activeCount={countActive(eventF, defaultEventFilters)}
          onReset={() => setEventF(defaultEventFilters)}
        >
          <ChipRow
            label="Type"
            value={eventF.category}
            onChange={(v) => setEventF({ ...eventF, category: v })}
            options={[
              { value: null, label: "All" },
              ...eventCategories(all)
                .slice(0, 6)
                .map((c) => ({ value: c, label: c })),
            ]}
          />
          <ChipRow
            label="Ticket"
            value={eventF.maxPrice}
            onChange={(v) => setEventF({ ...eventF, maxPrice: v })}
            options={[
              { value: null, label: "Any" },
              { value: 50, label: "Under $50" },
              { value: 100, label: "Under $100" },
              { value: 250, label: "Under $250" },
            ]}
          />
          <ChipRow
            label="Sort"
            value={eventF.sort}
            onChange={(v) => setEventF({ ...eventF, sort: v })}
            options={[
              { value: "match", label: "Best match" },
              { value: "date", label: "Date" },
              { value: "price", label: "Price" },
            ]}
          />
        </FilterPanel>
      );
      if (!shown.length)
        return (
          <View>
            {eventPanel}
            <Empty icon="ticket" label="No events match these filters." />
          </View>
        );
      const exactCount = events.data?.exactMatches?.length ?? 0;
      return (
        <View>
          {eventPanel}
          {shown.map((e, i) => (
        <EventCard
          key={e.id}
          event={e}
          featured={i === 0 && exactCount > 0}
          added={cart.has(e.id)}
          onToggle={() => {
            if (cart.has(e.id)) return cart.remove(e.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            /* Ticketmaster prices are per ticket; the cart carries what the
             * whole group pays, matching flights and hotels. */
            cart.add({
              id: e.id,
              type: "event",
              title: e.name,
              subtitle: travelers > 1 ? `${e.venueName} · ${travelers} tickets` : e.venueName,
              price: (e.priceMin ?? 0) * travelers,
              image: e.image,
              bookingUrl: e.url ?? null,
              provider: "Ticketmaster",
              meta: { venueLat: e.venueLat ?? null, venueLng: e.venueLng ?? null },
            });
          }}
        />
          ))}
        </View>
      );
    }
    if (section === "do") {
      if (suggestions.isPaused)
        return <ErrorCard what="picks" offline onRetry={() => suggestions.refetch()} />;
      if (suggestions.isError)
        return (
          <ErrorCard
            what="picks"
            message={errText(suggestions.error)}
            onRetry={() => suggestions.refetch()}
            retrying={suggestions.isRefetching}
          />
        );
      if (suggestions.isLoading)
        return <Loading label="Walter is thinking…" photo={destPhoto} />;
      const sAll = suggestions.data?.suggestions ?? [];
      if (!sAll.length)
        return <Empty icon="lightbulb" label="No suggestions yet." />;
      const s = applyPickFilters(sAll, pickF);
      const pickPanel = (
        <FilterPanel
          activeCount={countActive(pickF, defaultPickFilters)}
          onReset={() => setPickF(defaultPickFilters)}
        >
          <ChipRow
            label="Type"
            value={pickF.type}
            onChange={(v) => setPickF({ ...pickF, type: v })}
            options={[
              { value: "all", label: "All" },
              { value: "activity", label: "Activities" },
              { value: "restaurant", label: "Restaurants" },
              { value: "site", label: "Sites" },
            ]}
          />
          <ChipRow
            label="Cost"
            value={pickF.maxCost}
            onChange={(v) => setPickF({ ...pickF, maxCost: v })}
            options={[
              { value: null, label: "Any" },
              { value: 25, label: "Under $25" },
              { value: 75, label: "Under $75" },
              { value: 150, label: "Under $150" },
            ]}
          />
        </FilterPanel>
      );
      if (!s.length)
        return (
          <View>
            {pickPanel}
            <Empty icon="lightbulb" label="No picks match these filters." />
          </View>
        );
      return (
        <View>
          {pickPanel}
          {s.map((sug) => (
        <SuggestionCard
          key={sug.id}
          suggestion={sug}
          added={cart.has(sug.id)}
          onToggle={() => {
            if (cart.has(sug.id)) return cart.remove(sug.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            /* estimatedCost is per person by prompt contract; the cart
             * carries what the whole group pays. */
            cart.add({
              id: sug.id,
              type: sug.type,
              title: sug.title,
              subtitle: travelers > 1 ? `${sug.locationName} · for ${travelers}` : sug.locationName,
              price: (sug.estimatedCost ?? 0) * travelers,
              bookingUrl: `https://www.google.com/search?q=${encodeURIComponent(
                sug.bookingSearchQuery || `${sug.title} ${sug.locationName}`
              )}`,
              provider: "the web",
            });
          }}
        />
          ))}
        </View>
      );
    }
    return null;
  }, [section, flights, hotels, events, suggestions, cart, stayType, hasOrigin, destPhoto, travelers, flightF, hotelF, eventF, pickF]);

  return (
    <View className="flex-1 bg-page-bg">
      <Stack.Screen
        options={{
          /* No background of our own: iOS wraps headerRight in its own
           * capsule, and a filled pill inside it read as two circles. */
          headerRight: () =>
            itemCount > 0 ? (
              <Pressable
                onPress={() => router.push("/trip")}
                accessibilityRole="button"
                accessibilityLabel={`View your trip, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                className="flex-row items-center gap-1.5 px-1.5 py-1.5"
              >
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: colors.accent }}
                >
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Text>
                <SymbolView
                  name="arrow.right"
                  tintColor={colors.accent}
                  size={13}
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
      >
        {!hasDates ? (
          <DatesPrompt
            onSubmit={(start, end) =>
              usePrefs.getState().patch({ startDate: start, endDate: end })
            }
          />
        ) : (
          <>
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
          </>
        )}
      </ScrollView>

    </View>
  );
}

function DatesPrompt({
  onSubmit,
}: {
  onSubmit: (start: string, end: string) => void;
}) {
  const [start, setStart] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();
  const ready = !!(start && end);
  return (
    <View className="bg-card rounded-2xl p-5 border border-line">
      <Text className="text-ink text-[16px] font-semibold">
        When are you going?
      </Text>
      <Text className="text-ink-faint text-[12px] mt-1 mb-3 leading-4">
        Dates drive everything — fares, rooms, and what's on in town while
        you're there.
      </Text>
      <DateRangePicker
        startDate={start}
        endDate={end}
        onChange={(s, e) => {
          setStart(s);
          setEnd(e);
        }}
      />
      <Pressable
        disabled={!ready}
        onPress={() => ready && onSubmit(start, end)}
        accessibilityRole="button"
        accessibilityLabel="Search with these dates"
        className="mt-3 py-3 rounded-full items-center"
        style={{ backgroundColor: ready ? colors.accent : colors.surface2 }}
      >
        <Text
          className="text-[14px] font-semibold"
          style={{ color: ready ? "white" : colors.textTertiary }}
        >
          Search these dates
        </Text>
      </Pressable>
    </View>
  );
}

function errText(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

function ErrorCard({
  what,
  message,
  onRetry,
  retrying,
  offline,
}: {
  what: string;
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
  offline?: boolean;
}) {
  return (
    <View className="bg-card rounded-2xl p-5 border border-line items-center">
      <SymbolView
        name={offline ? "wifi.slash" : "exclamationmark.triangle"}
        tintColor={colors.textTertiary}
        size={28}
        fallback={null}
      />
      <Text className="text-ink text-[15px] font-semibold mt-3 text-center">
        {offline ? "You're offline" : "That search hit a snag"}
      </Text>
      <Text className="text-ink-soft text-[13px] mt-1 text-center leading-5">
        {offline
          ? "Reconnect and Walter picks up where he left off."
          : message || "Give it another try in a moment."}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={`Retry the ${what} search`}
        className="mt-4 px-6 py-2.5 rounded-full"
        style={{ backgroundColor: colors.surface2 }}
      >
        <Text className="text-ink text-[13px] font-semibold">
          {retrying ? "Trying…" : "Try again"}
        </Text>
      </Pressable>
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

