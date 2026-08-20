import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, Text, View } from "react-native";

import { parseDurationMin, tripEconomics } from "../lib/tripEconomics";
import { useSavedTrips, type SavedTrip } from "../lib/stores/savedTripsStore";
import { useTripCart } from "../lib/stores/tripCartStore";
import { usePrefs } from "../lib/stores/walterPrefsStore";
import { colors } from "../theme/colors";

/* Saved trips side by side with the numbers that decide it: the true
 * all-in cost, per person and per day, flight length, affordability. */
export default function CompareScreen() {
  const travelers = usePrefs((s) => s.prefs.travelers) ?? 2;
  const trips = useSavedTrips((s) => s.trips).filter(
    (t) => t.items.length > 0
  );

  const ecos = trips.map((t) => tripEconomics(t, travelers));
  const cheapest = Math.min(
    ...ecos.filter((e) => e.total > 0).map((e) => e.total)
  );
  const durations = ecos
    .map((e) => e.flightDuration)
    .filter(Boolean) as string[];

  const open = (trip: SavedTrip) => {
    useTripCart.setState({
      items: trip.items,
      bookedIds: trip.bookedIds ?? [],
    });
    usePrefs.getState().patch({
      destination: trip.destination,
      startDate: trip.startDate ?? "",
      endDate: trip.endDate ?? "",
    });
    router.push("/trip");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Compare trips" }} />
      <ScrollView
        className="flex-1 bg-page-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {trips.length < 2 ? (
          <View className="items-center py-24 px-6">
            <SymbolView
              name="rectangle.on.rectangle"
              tintColor={colors.textTertiary}
              size={34}
              fallback={null}
            />
            <Text className="text-ink text-[17px] font-semibold mt-4 text-center">
              Save two built-out trips to compare them
            </Text>
            <Text className="text-ink-soft text-[13px] mt-2 text-center leading-5">
              Build a cart, save it from the trip screen, and it shows up here
              with the real numbers.
            </Text>
          </View>
        ) : (
          trips.map((trip, i) => {
            const eco = ecos[i];
            const badges: string[] = [];
            if (eco.total > 0 && eco.total === cheapest) badges.push("Cheapest overall");
            if (
              eco.flightDuration &&
              durations.length > 1 &&
              durations.every(
                (d) =>
                  parseDurationMin(eco.flightDuration!) <= parseDurationMin(d)
              )
            ) {
              badges.push("Shortest flight");
            }
            return (
              <View
                key={trip.id}
                className="bg-card rounded-3xl border p-5 mb-4"
                style={{
                  borderColor: badges.includes("Cheapest overall")
                    ? colors.accent
                    : colors.hairline,
                  borderWidth: badges.includes("Cheapest overall") ? 2 : 1,
                }}
              >
                <Text className="text-ink text-[18px] font-bold tracking-tight">
                  {trip.destination.split(",")[0]}
                </Text>
                <Text className="text-ink-soft text-[13px] mt-0.5" numberOfLines={1}>
                  {trip.name}
                  {eco.days ? ` · ${eco.days} days` : ""} · {eco.travelers}{" "}
                  {eco.travelers === 1 ? "traveler" : "travelers"}
                </Text>

                <View className="flex-row flex-wrap gap-1.5 mt-3">
                  {badges.map((b) => (
                    <View
                      key={b}
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <Text className="text-white text-[11px] font-bold">{b}</Text>
                    </View>
                  ))}
                  <View
                    className="rounded-full px-2.5 py-1 border"
                    style={{ borderColor: colors.hairlineStrong }}
                  >
                    <Text className="text-ink text-[11px] font-semibold">
                      {eco.tier.label}
                    </Text>
                  </View>
                </View>

                {/* True cost */}
                <View
                  className="rounded-2xl p-4 mt-4"
                  style={{ backgroundColor: colors.surface1 }}
                >
                  <View className="flex-row items-baseline justify-between">
                    <Text className="text-ink-soft text-[13px]">True cost, all in</Text>
                    <Text
                      className="text-[24px] font-bold tabular-nums"
                      style={{ color: colors.accent }}
                    >
                      ${eco.total.toLocaleString()}
                    </Text>
                  </View>
                  <Text className="text-ink-faint text-[11px] mt-0.5">
                    {eco.perPerson != null ? `$${eco.perPerson.toLocaleString()}/person` : ""}
                    {eco.perDay != null ? ` · $${eco.perDay.toLocaleString()}/day` : ""}
                  </Text>
                  <View
                    className="mt-3 pt-3 border-t"
                    style={{ borderTopColor: colors.hairline }}
                  >
                    <Row label="Flights" value={eco.flights} />
                    <Row label="Stay" value={eco.stay} />
                    <Row label="Events and activities" value={eco.fun} />
                    <Row label="Food and getting around (est.)" value={eco.extras} faint />
                  </View>
                  <Text className="text-ink-faint text-[11px] mt-2 leading-4">
                    {eco.tier.blurb}
                  </Text>
                </View>

                {/* Flight time */}
                <View className="flex-row items-center justify-between mt-3.5">
                  <View className="flex-row items-center gap-2">
                    <SymbolView
                      name="airplane"
                      tintColor={colors.accent}
                      size={14}
                      fallback={null}
                    />
                    <Text className="text-ink text-[13px] font-semibold">Flight time</Text>
                  </View>
                  <Text className="text-ink text-[13px] font-semibold">
                    {eco.flightDuration
                      ? `${eco.flightDuration}${
                          eco.flightStops != null
                            ? eco.flightStops === 0
                              ? " · nonstop"
                              : ` · ${eco.flightStops} stop${eco.flightStops > 1 ? "s" : ""}`
                            : ""
                        }`
                      : "No flight added"}
                  </Text>
                </View>

                <Pressable
                  onPress={() => open(trip)}
                  accessibilityRole="button"
                  className="mt-4 py-3 rounded-full items-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Text className="text-white text-[14px] font-semibold">
                    Open this trip
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
        {trips.length >= 2 ? (
          <Text className="text-ink-faint text-[11px] text-center mt-2 leading-4 px-4">
            Flight, stay, and ticket prices are the live prices these carts
            were built from. The food line is an estimate so totals reflect
            what the trip really costs.
          </Text>
        ) : null}
      </ScrollView>
    </>
  );
}

function Row({
  label,
  value,
  faint = false,
}: {
  label: string;
  value: number;
  faint?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text
        className="text-[13px]"
        style={{ color: faint ? colors.textTertiary : colors.textSecondary }}
      >
        {label}
      </Text>
      <Text
        className="text-[13px] font-semibold tabular-nums"
        style={{ color: faint ? colors.textTertiary : colors.text }}
      >
        {value > 0 ? `$${value.toLocaleString()}` : "–"}
      </Text>
    </View>
  );
}
