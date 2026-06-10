import { SymbolView } from "expo-symbols";
import { ScrollView, Text, View } from "react-native";

import { selectTotalPrice, useTripCart } from "../../lib/stores/tripCartStore";
import { colors } from "../../theme/colors";

export default function SavedScreen() {
  const items = useTripCart((s) => s.items);
  const total = useTripCart(selectTotalPrice);

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-page-bg items-center justify-center px-8">
        <SymbolView
          name="bookmark"
          tintColor={colors.textTertiary}
          size={56}
          fallback={null}
        />
        <Text className="text-white text-[22px] font-bold mt-5 tracking-tight">
          Nothing saved yet
        </Text>
        <Text className="text-white/55 text-[14px] text-center mt-2 leading-5">
          When you pick flights, hotels, or activities while building a trip,
          they land here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
    >
      <View className="bg-surface-1 rounded-2xl p-5 mb-4 border border-white/10">
        <Text className="text-white/55 text-[12px] uppercase tracking-wider">
          Trip total
        </Text>
        <Text className="text-white text-[32px] font-bold mt-1">
          ${total.toLocaleString()}
        </Text>
        <Text className="text-white/55 text-[13px] mt-1">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </Text>
      </View>

      {items.map((i) => (
        <View
          key={i.id}
          className="bg-surface-1 rounded-2xl p-4 mb-3 border border-white/10"
        >
          <Text className="text-white/45 text-[11px] uppercase tracking-wider">
            {i.type}
          </Text>
          <Text className="text-white text-[16px] font-semibold mt-1">
            {i.title}
          </Text>
          {i.subtitle ? (
            <Text className="text-white/55 text-[13px] mt-0.5">
              {i.subtitle}
            </Text>
          ) : null}
          <Text className="text-white text-[15px] font-semibold mt-2">
            ${i.price.toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
