import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { api } from "../../lib/apiClient";
import { useSavedTrips } from "../../lib/stores/savedTripsStore";
import { useTripCart } from "../../lib/stores/tripCartStore";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

export default function TripsScreen() {
  const trips = useSavedTrips((s) => s.trips);
  const remove = useSavedTrips((s) => s.remove);

  if (trips.length === 0) {
    return (
      <View className="flex-1 bg-page-bg items-center justify-center px-8">
        <SymbolView
          name="suitcase"
          tintColor={colors.textTertiary}
          size={56}
          fallback={null}
        />
        <Text className="text-ink text-[22px] font-bold mt-5 tracking-tight">
          No trips yet
        </Text>
        <Text className="text-ink-soft text-[14px] text-center mt-2 leading-5">
          Build a trip and tap the bookmark to keep it here. Every saved trip
          reopens exactly where you left it.
        </Text>
        <Pressable
          onPress={() => router.push("/search")}
          className="mt-6 px-6 py-3.5 rounded-full"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white text-[14px] font-semibold">
            Start a trip
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
    >
      {trips.map((trip) => (
        <Pressable
          key={trip.id}
          onPress={() => {
            /* Reopen the trip: its items become the active cart. */
            useTripCart.setState({ items: trip.items, bookedIds: [] });
            usePrefs.getState().patch({
              destination: trip.destination,
              startDate: trip.startDate ?? "",
              endDate: trip.endDate ?? "",
            });
            router.push("/trip");
          }}
          className="bg-card rounded-3xl overflow-hidden border border-line mb-4"
        >
          <Image
            source={{ uri: api.photo.url(trip.destination) }}
            contentFit="cover"
            transition={200}
            style={{ width: "100%", height: 150 }}
          />
          <View className="p-4 flex-row items-center">
            <View className="flex-1 mr-3">
              <Text className="text-ink text-[16px] font-semibold" numberOfLines={1}>
                {trip.name}
              </Text>
              <Text className="text-ink-soft text-[13px] mt-0.5" numberOfLines={1}>
                ${trip.totalCost.toLocaleString()} · {trip.items.length}{" "}
                {trip.items.length === 1 ? "item" : "items"} · saved{" "}
                {new Date(trip.savedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert("Remove this trip?", trip.name, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      remove(trip.id);
                    },
                  },
                ])
              }
            >
              <SymbolView
                name="trash"
                tintColor={colors.textTertiary}
                size={17}
                fallback={null}
              />
            </Pressable>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
