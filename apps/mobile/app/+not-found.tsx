import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

import { colors } from "../theme/colors";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Off the map" }} />
      <View className="flex-1 bg-page-bg items-center justify-center px-8">
        <SymbolView
          name="map"
          tintColor={colors.textTertiary}
          size={48}
          fallback={null}
        />
        <Text className="text-ink text-[22px] font-bold mt-4 tracking-tight text-center">
          Walter hasn't scouted this route
        </Text>
        <Text className="text-ink-soft text-[14px] mt-2 text-center leading-5">
          The page you're looking for doesn't exist.
        </Text>
        <Link
          href="/"
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.accent, color: "white", fontSize: 14, fontWeight: "600" }}
        >
          Back to start
        </Link>
      </View>
    </>
  );
}
