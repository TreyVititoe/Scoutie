import Mapbox from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { api } from "../../lib/apiClient";
import {
  selectTotalPrice,
  useTripCart,
} from "../../lib/stores/tripCartStore";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";

export default function TripScreen() {
  const prefs = usePrefs((s) => s.prefs);
  const items = useTripCart((s) => s.items);
  const clear = useTripCart((s) => s.clear);
  const total = useTripCart(selectTotalPrice);

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
                  await Share.share({
                    message: `My ${prefs.destination} trip on Walter: $${total.toLocaleString()} for ${items.length} items.`,
                  });
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
            {MAPBOX_TOKEN ? (
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
                  <Mapbox.Camera zoomLevel={9} centerCoordinate={[0, 0]} animationMode="flyTo" />
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
                <Text className="text-ink text-[18px] font-bold tracking-tight mb-3">
                  Pack
                </Text>
                {packing.data.categories.map((cat) => (
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
            ) : null}

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
              className="mx-4 mt-8 py-3.5 rounded-full items-center border border-line-strong"
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
