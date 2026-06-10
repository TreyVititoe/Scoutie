import { CURATED_TRIPS, CATEGORY_LABELS } from "@walter/shared";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { TripCard } from "../../components/TripCard";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const FILTERS = ["all", "coastlines", "wild", "cities", "northern", "table"] as const;
type Filter = (typeof FILTERS)[number];

export default function ExploreScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [, setRefreshNonce] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshNonce((n) => n + 1);
    setTimeout(() => setRefreshing(false), 500);
  }, []);
  const trips = useMemo(
    () =>
      filter === "all"
        ? CURATED_TRIPS
        : CURATED_TRIPS.filter((t) => t.category === filter),
    [filter]
  );
  const cardWidth = (Dimensions.get("window").width - 16 * 3) / 2;

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.text}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className="px-4 py-2 rounded-full border"
              style={{
                backgroundColor: active ? colors.accent : "transparent",
                borderColor: active ? colors.accent : colors.hairlineStrong,
              }}
            >
              <Text
                className="text-[13px] font-medium tracking-tight"
                style={{ color: active ? "white" : colors.text }}
              >
                {f === "all" ? "All" : CATEGORY_LABELS[f]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-row flex-wrap gap-4 px-4 mt-4">
        {trips.map((t) => (
          <TripCard
            key={t.id}
            trip={t}
            width={cardWidth}
            onPress={() => {
              usePrefs.getState().patch({
                destination: t.destination,
                durationDays: t.durationDays,
              });
              router.push("/clarify");
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
