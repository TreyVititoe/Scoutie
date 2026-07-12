import Mapbox from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { getApiBaseUrl } from "@walter/api-client";

import { api } from "../../lib/apiClient";
import {
  selectTotalPrice,
  useTripCart,
} from "../../lib/stores/tripCartStore";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";

export default function TripScreen() {
  const [packCollapsed, setPackCollapsed] = useState(false);
  const prefs = usePrefs((s) => s.prefs);
  const items = useTripCart((s) => s.items);
  const bookedIds = useTripCart((s) => s.bookedIds);
  const clear = useTripCart((s) => s.clear);
  const total = useTripCart(selectTotalPrice);

  const bookedCount = items.filter((i) => bookedIds.includes(i.id)).length;

  /* Center the map on the destination; [0,0] is the Gulf of Guinea. */
  const geo = useQuery({
    queryKey: ["geocode", prefs.destination],
    queryFn: async () => {
      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          prefs.destination ?? ""
        )}.json?types=place,region,country&limit=1&access_token=${MAPBOX_TOKEN}`
      );
      const data = await resp.json();
      return (data.features?.[0]?.center ?? null) as [number, number] | null;
    },
    enabled: !!prefs.destination && !!MAPBOX_TOKEN,
    staleTime: Infinity,
  });

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const i of items) {
      (g[i.type] = g[i.type] ?? []).push(i);
    }
    return g;
  }, [items]);

  const packing = useQuery({
    queryKey: ["packing", prefs],
    queryFn: () =>
      api.packingList.generate({
        destination: prefs.destination ?? "",
        startDate: prefs.startDate ?? "",
        endDate: prefs.endDate ?? "",
        activities: prefs.vibes ?? [],
        pace: prefs.devotion ?? "balanced",
        travelers: prefs.travelers ?? 2,
      }),
    enabled: !!prefs.destination && items.length > 0,
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            items.length > 0 ? (
              <Pressable
                onPress={async () => {
                  const summary = `My ${prefs.destination} trip on Walter: $${total.toLocaleString()} for ${items.length} items.`;
                  try {
                    const { shareSlug } = await api.trips.share({
                      title: `Trip to ${prefs.destination ?? "somewhere good"}`,
                      destination: prefs.destination ?? "",
                      totalCost: total,
                      items,
                    });
                    const url = `${getApiBaseUrl()}/shared/${shareSlug}`;
                    await Share.share({ message: `${summary}\n${url}`, url });
                  } catch {
                    await Share.share({ message: summary });
                  }
                }}
              >
                <SymbolView
                  name="square.and.arrow.up"
                  tintColor={colors.accent}
                  size={20}
                  fallback={null}
                />
              </Pressable>
            ) : null,
        }}
      />
      <ScrollView
        className="flex-1 bg-page-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {items.length === 0 ? (
          <View className="items-center py-24 px-8">
            <SymbolView
              name="suitcase"
              tintColor={colors.textTertiary}
              size={48}
              fallback={null}
            />
            <Text className="text-ink text-[18px] font-semibold mt-4 text-center">
              Nothing in this trip yet
            </Text>
            <Text className="text-ink-soft text-[13px] text-center mt-2 leading-5">
              Build a trip from the search above to see flights, hotels, and
              activities here.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View className="mx-4 mt-2 bg-card rounded-2xl p-5 border border-line">
              <Text className="text-ink-faint text-[12px] uppercase tracking-wider">
                {prefs.destination}
              </Text>
              <Text className="text-ink text-[32px] font-bold mt-1">
                ${total.toLocaleString()}
              </Text>
              <Text className="text-ink-soft text-[13px] mt-1">
                {items.length} items across {Object.keys(grouped).length}{" "}
                categories
              </Text>
            </View>

            {/* Map */}
            {MAPBOX_TOKEN && geo.data ? (
              <View
                className="mx-4 mt-4 rounded-2xl overflow-hidden border border-line"
                style={{ height: 240 }}
              >
                <Mapbox.MapView
                  styleURL={Mapbox.StyleURL.Light}
                  style={{ flex: 1 }}
                  scaleBarEnabled={false}
                  attributionEnabled={false}
                  logoEnabled={false}
                >
                  <Mapbox.Camera zoomLevel={9} centerCoordinate={geo.data} animationMode="flyTo" />
                </Mapbox.MapView>
              </View>
            ) : null}

            {/* Items grouped by type */}
            {Object.entries(grouped).map(([type, list]) => (
              <View key={type} className="mt-6 px-4">
                <Text className="text-ink text-[18px] font-bold tracking-tight mb-3 capitalize">
                  {type === "site" ? "Sites" : `${type}s`}
                </Text>
                {list.map((i) => (
                  <View
                    key={i.id}
                    className="bg-card rounded-2xl p-4 mb-2 border border-line"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-ink text-[15px] font-semibold">
                          {i.title}
                        </Text>
                        {i.subtitle ? (
                          <Text className="text-ink-soft text-[12px] mt-1">
                            {i.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      <Text className="text-ink text-[15px] font-bold">
                        ${i.price.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {/* Packing list */}
            {packing.data ? (
              <View className="mt-6 px-4">
                <Pressable
                  onPress={() => setPackCollapsed((c) => !c)}
                  className="flex-row items-center justify-between mb-3"
                  hitSlop={6}
                >
                  <Text className="text-ink text-[18px] font-bold tracking-tight">
                    Pack
                  </Text>
                  <SymbolView
                    name={packCollapsed ? "chevron.down" : "chevron.up"}
                    tintColor={colors.textSecondary}
                    size={15}
                    fallback={null}
                  />
                </Pressable>
                {!packCollapsed && packing.data.categories.map((cat) => (
                  <View
                    key={cat.name}
                    className="bg-card rounded-2xl p-4 mb-2 border border-line"
                  >
                    <Text className="text-ink text-[14px] font-semibold mb-2">
                      {cat.name}
                    </Text>
                    {cat.items.map((it, idx) => (
                      <View
                        key={`${cat.name}-${idx}`}
                        className="flex-row justify-between py-1"
                      >
                        <Text className="text-ink-soft text-[13px]">
                          {it.name}
                          {it.essential ? (
                            <Text className="text-accent"> · essential</Text>
                          ) : null}
                        </Text>
                        <Text className="text-ink-faint text-[13px]">
                          {it.quantity}x
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : packing.isLoading ? (
              <View className="items-center mt-6">
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : packing.isError ? (
              <View className="mx-4 mt-6 bg-card rounded-2xl p-4 border border-line items-center">
                <Text className="text-ink-soft text-[13px] text-center">
                  The packing list didn't load.
                </Text>
                <Pressable
                  onPress={() => packing.refetch()}
                  className="mt-3 px-5 py-2 rounded-full"
                  style={{ backgroundColor: colors.surface2 }}
                >
                  <Text className="text-ink text-[13px] font-medium">
                    Try again
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              /* Route types regenerate on next `expo start`; cast until then. */
              onPress={() => router.push("/checkout" as Parameters<typeof router.push>[0])}
              className="mx-4 mt-8 py-4 rounded-full items-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="text-white text-[15px] font-semibold">
                {bookedCount > 0
                  ? `Book your trip · ${bookedCount} of ${items.length} done`
                  : "Book your trip"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Clear trip?",
                  "This removes all items from your saved trip.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: () => {
                        clear();
                        router.back();
                      },
                    },
                  ]
                )
              }
              className="mx-4 mt-3 py-3.5 rounded-full items-center border border-line-strong"
            >
              <Text className="text-ink-soft text-[14px] font-medium">
                Clear trip
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}
