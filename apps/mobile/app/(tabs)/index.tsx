import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_TAGLINES,
  CURATED_TRIPS,
} from "@walter/shared";
import { api } from "@walter/api-client";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SearchPill } from "../../components/SearchPill";
import { TripCard } from "../../components/TripCard";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const HERO_QUERY = "Reykjavik Iceland aurora";

export default function HomeScreen() {
  const prefs = usePrefs((s) => s.prefs);
  const [refreshing, setRefreshing] = useState(false);
  const [heroNonce, setHeroNonce] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHeroNonce((n) => n + 1);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const byCategory = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      key: cat,
      label: CATEGORY_LABELS[cat],
      tagline: CATEGORY_TAGLINES[cat],
      trips: CURATED_TRIPS.filter((t) => t.category === cat),
    }));
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.text}
        />
      }
    >
      {/* Hero */}
      <View className="mx-4 rounded-3xl overflow-hidden mb-6" style={{ height: 280 }}>
        <Image
          source={{ uri: `${api.photo.url(HERO_QUERY)}&n=${heroNonce}` }}
          contentFit="cover"
          transition={400}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          className="absolute inset-x-0 bottom-0 p-5"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <Text className="text-white text-[26px] font-bold leading-tight tracking-tight">
            Get off the couch.
          </Text>
          <Text className="text-white/80 text-[14px] mt-1">
            Trips Walter has scouted. Pick a thread and pull.
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 mb-8">
        <SearchPill
          destination={prefs.destination}
          duration={
            prefs.durationDays ? `${prefs.durationDays} days` : undefined
          }
          devotion={prefs.devotion}
          onPress={() => router.push("/search")}
        />
      </View>

      {/* Curated rails */}
      {byCategory.map((rail) => (
        <View key={rail.key} className="mb-8">
          <View className="px-4 mb-3">
            <Text className="text-white text-[22px] font-bold tracking-tight">
              {rail.label}
            </Text>
            <Text className="text-white/55 text-[13px] mt-0.5">
              {rail.tagline}
            </Text>
          </View>
          <FlatList
            data={rail.trips}
            keyExtractor={(t) => t.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 12,
            }}
            renderItem={({ item }) => (
              <TripCard
                trip={item}
                onPress={() => {
                  usePrefs.getState().patch({
                    destination: item.destination,
                    durationDays: item.durationDays,
                  });
                  router.push("/clarify");
                }}
              />
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}
