import { getApiBaseUrl } from "@walter/api-client";
import { Linking, Pressable, Text, View } from "react-native";

/* The web app already serves /privacy and /terms; the base URL is env-driven
 * so a future domain cutover carries these links along. */
export function LegalLinks() {
  const base = getApiBaseUrl() || "https://scoutie.vercel.app";
  return (
    <View className="flex-row items-center justify-center gap-6">
      <Pressable
        accessibilityRole="link"
        hitSlop={10}
        onPress={() => Linking.openURL(`${base}/privacy`).catch(() => {})}
      >
        <Text className="text-ink-faint text-[12px] underline">
          Privacy Policy
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        hitSlop={10}
        onPress={() => Linking.openURL(`${base}/terms`).catch(() => {})}
      >
        <Text className="text-ink-faint text-[12px] underline">Terms</Text>
      </Pressable>
    </View>
  );
}
