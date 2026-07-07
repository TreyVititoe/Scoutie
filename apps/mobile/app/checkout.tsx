import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { providerLabel, trackAndOpen } from "../lib/affiliate";
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
                      {item.subtitle ? (
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

        <Text className="text-ink-faint text-[11px] text-center mt-6 leading-4 px-6">
          Walter earns a commission when you book through our links at no extra
          cost to you.
        </Text>
      </ScrollView>
    </>
  );
}
