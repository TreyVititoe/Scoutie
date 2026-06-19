import { CATEGORY_LABELS, CATEGORY_ORDER, CURATED_TRIPS } from "@walter/shared";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TripCard } from "../../components/TripCard";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const SIDE = 20;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Two cards across with a sliver of the third peeking, Airbnb-style.
  const cardWidth = Math.round((width - SIDE * 2 - 14) / 2.08);

  const rails = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        key: cat,
        label: CATEGORY_LABELS[cat],
        trips: CURATED_TRIPS.filter((t) => t.category === cat),
      })).filter((r) => r.trips.length > 0),
    []
  );

  return (
    <View className="flex-1 bg-page-bg">
      {/* Pinned search header */}
      <View style={{ paddingTop: insets.top + 6 }} className="bg-page-bg px-5 pb-3">
        <Pressable
          onPress={() => router.push("/search")}
          className="bg-card flex-row items-center rounded-full px-5"
          style={{
            height: 56,
            borderWidth: 1,
            borderColor: colors.hairline,
            shadowColor: colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <SymbolView
            name="magnifyingglass"
            tintColor={colors.text}
            size={19}
            fallback={null}
          />
          <Text className="text-ink text-[16px] font-semibold ml-3">
            Start your search
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 110 }}
      >
        {rails.map((rail) => (
          <View key={rail.key} className="mb-7">
            <View className="px-5 mb-3 flex-row items-center justify-between">
              <Text
                className="text-ink text-[21px] font-bold tracking-tight flex-1 mr-3"
                numberOfLines={1}
              >
                {rail.label}
              </Text>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.surface2 }}
              >
                <SymbolView
                  name="arrow.right"
                  tintColor={colors.text}
                  size={15}
                  fallback={null}
                />
              </View>
            </View>
            <FlatList
              data={rail.trips}
              keyExtractor={(t) => t.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIDE, gap: 14 }}
              renderItem={({ item }) => (
                <TripCard
                  trip={item}
                  width={cardWidth}
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
    </View>
  );
}
