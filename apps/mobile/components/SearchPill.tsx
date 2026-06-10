import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  onPress?: () => void;
  destination?: string;
  duration?: string;
  devotion?: string;
};

export function SearchPill({
  onPress,
  destination,
  duration,
  devotion,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-full flex-row items-center gap-3 px-5 py-3.5 border border-line"
      style={{
        shadowColor: colors.shadow,
        shadowOpacity: 0.1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <SymbolView
        name="magnifyingglass"
        tintColor={colors.text}
        size={20}
        fallback={null}
      />
      <View className="flex-1">
        <Text className="text-ink text-[15px] font-semibold tracking-tight">
          {destination ?? "Where to next?"}
        </Text>
        <Text className="text-ink-soft text-[12px] mt-0.5">
          {duration ?? "Any week"} · {devotion ?? "Any pace"}
        </Text>
      </View>
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.accent }}
      >
        <SymbolView
          name="arrow.right"
          tintColor="white"
          size={16}
          fallback={null}
        />
      </View>
    </Pressable>
  );
}
