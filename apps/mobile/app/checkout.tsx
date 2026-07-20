import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { providerLabel, trackAndOpen } from "../lib/affiliate";
import { api } from "../lib/apiClient";
import { selectTotalPrice, useTripCart } from "../lib/stores/tripCartStore";
import { usePrefs } from "../lib/stores/walterPrefsStore";
import { colors } from "../theme/colors";

const TYPE_LABELS: Record<string, string> = {
  flight: "Flights",
  hotel: "Stays",
  event: "Events",
  activity: "Activities",
  restaurant: "Restaurants",
  site: "Sites",
};

export default function CheckoutScreen() {
  const prefs = usePrefs((s) => s.prefs);
  const items = useTripCart((s) => s.items);
  const bookedIds = useTripCart((s) => s.bookedIds);
  const toggleBooked = useTripCart((s) => s.toggleBooked);
  const total = useTripCart(selectTotalPrice);

  const destination = prefs.destination ?? "";
  const bookedCount = items.filter((i) => bookedIds.includes(i.id)).length;
  const allBooked = items.length > 0 && bookedCount === items.length;

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const i of items) {
      (g[i.type] = g[i.type] ?? []).push(i);
    }
    return g;
  }, [items]);

  return (
    <>
      <Stack.Screen options={{ title: "Book your trip" }} />
      <ScrollView
        className="flex-1 bg-page-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* The place you're committing to */}
        {destination ? (
          <View className="rounded-3xl overflow-hidden mb-4" style={{ height: 200 }}>
            <Image
              source={{ uri: api.photo.url(destination) }}
              contentFit="cover"
              transition={300}
              style={{ position: "absolute", inset: 0 }}
            />
            <LinearGradient
              colors={["transparent", "rgba(15, 20, 34, 0.75)"]}
              locations={[0.35, 1]}
              style={{ position: "absolute", inset: 0 }}
            />
            <View className="flex-1 justify-end p-5">
              <Text className="text-white/70 text-[11px] font-semibold uppercase tracking-widest">
                {allBooked ? "Locked in" : "Securing your trip"}
              </Text>
              <Text
                className="text-white font-semibold mt-0.5"
                style={{ fontSize: 26, lineHeight: 29, letterSpacing: -0.3 }}
                numberOfLines={1}
              >
                {destination.split(",")[0]}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Progress */}
        <View className="bg-card rounded-2xl p-5 border border-line">
          <Text className="text-ink text-[24px] font-bold">
            {allBooked
              ? "Trip booked. Go pack."
              : `${bookedCount} of ${items.length} booked`}
          </Text>
          <Text className="text-ink-soft text-[13px] mt-1 leading-5">
            {allBooked
              ? "Every confirmation lives with its provider. Walter keeps the itinerary."
              : "Each piece books with its provider. Check items off as you go."}
          </Text>
          <View
            className="mt-4 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.surface2 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: colors.accent,
                width: `${items.length ? (bookedCount / items.length) * 100 : 0}%`,
              }}
            />
          </View>
          <View className="flex-row justify-between mt-4 pt-4 border-t border-line">
            <Text className="text-ink-soft text-[14px]">Trip total</Text>
            <Text className="text-ink text-[16px] font-bold">
              ${total.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Checklist */}
        {Object.entries(grouped).map(([type, list]) => (
          <View key={type} className="mt-6">
            <Text className="text-ink text-[18px] font-bold tracking-tight mb-3">
              {TYPE_LABELS[type] ?? type}
            </Text>
            {list.map((item) => {
              const isBooked = bookedIds.includes(item.id);
              return (
                <View
                  key={item.id}
                  className="bg-card rounded-2xl p-4 mb-2 border border-line"
                >
                  <View className="flex-row items-center">
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleBooked(item.id);
                      }}
                      hitSlop={8}
                      className="mr-3"
                    >
                      <SymbolView
                        name={isBooked ? "checkmark.circle.fill" : "circle"}
                        tintColor={isBooked ? colors.accent : colors.textTertiary}
                        size={26}
                        fallback={null}
                      />
                    </Pressable>
                    <View className="flex-1 mr-3">
                      <Text
                        className={`text-[15px] font-semibold ${
                          isBooked ? "text-ink-faint line-through" : "text-ink"
                        }`}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {isBooked ? (
                        <Text className="text-accent text-[12px] font-medium mt-0.5" numberOfLines={1}>
                          Booked on {providerLabel(item)}
                        </Text>
                      ) : item.subtitle ? (
                        <Text
                          className="text-ink-soft text-[12px] mt-0.5"
                          numberOfLines={1}
                        >
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <Text className="text-ink text-[15px] font-bold mr-3">
                      ${item.price.toLocaleString()}
                    </Text>
                  </View>
                  {!isBooked ? (
                    <Pressable
                      onPress={() => trackAndOpen(item, destination)}
                      className="mt-3 py-2.5 rounded-full items-center flex-row justify-center gap-1.5"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <Text className="text-white text-[13px] font-semibold">
                        {item.bookingUrl
                          ? `Book on ${providerLabel(item)}`
                          : "Find online"}
                      </Text>
                      <SymbolView
                        name="arrow.up.right"
                        tintColor="white"
                        size={12}
                        fallback={null}
                      />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}

        {allBooked ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/trip"))}
            className="rounded-3xl p-6 mt-6 items-center"
            style={{ backgroundColor: "#141926" }}
          >
            <SymbolView
              name="checkmark.seal.fill"
              tintColor={colors.accent}
              size={28}
              fallback={null}
            />
            <Text className="text-white text-[20px] font-semibold mt-3">
              Trip complete. Go pack.
            </Text>
            <Text className="text-white/60 text-[13px] mt-1 text-center">
              Your packing list is waiting on the itinerary.
            </Text>
          </Pressable>
        ) : null}

        <Text className="text-ink-faint text-[11px] text-center mt-6 leading-4 px-6">
          Walter earns a commission when you book through our links at no extra
          cost to you.
        </Text>
      </ScrollView>
    </>
  );
}
