import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { usePrefs } from "../lib/stores/walterPrefsStore";
import { colors } from "../theme/colors";

type Feature = {
  id: string;
  place_name: string;
  text: string;
  place_type: string[];
  context?: { id: string; text: string }[];
};

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";

const QUICK_PICKS = [
  { label: "Anywhere warm", icon: "sun.max.fill", query: "" },
  { label: "Northern lights", icon: "sparkles", query: "Iceland" },
  { label: "Coastal", icon: "water.waves", query: "Lisbon" },
  { label: "Big cities", icon: "building.2.fill", query: "Tokyo" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2 || !MAPBOX_TOKEN) {
      setFeatures([]);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?types=place,region,country&limit=6&access_token=${MAPBOX_TOKEN}`,
          { signal: controller.signal }
        );
        const data = await resp.json();
        setFeatures(data.features ?? []);
      } catch (e) {
        if (!(e instanceof Error && e.name === "AbortError"))
          console.warn("geocode failed", e);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const pick = (destination: string) => {
    usePrefs.getState().patch({ destination });
    router.replace("/clarify");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.pageBg }}
    >
      <View className="px-4 pt-4">
        <View className="bg-surface-1 rounded-2xl border border-white/10 flex-row items-center px-4 py-3.5">
          <SymbolView
            name="magnifyingglass"
            tintColor={colors.textSecondary}
            size={18}
            fallback={null}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a city, country, or region"
            placeholderTextColor={colors.textTertiary}
            className="flex-1 ml-3 text-white text-[15px]"
            autoCorrect={false}
            autoCapitalize="words"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => {
              if (features[0]) pick(features[0].place_name);
            }}
          />
          {loading ? <ActivityIndicator color={colors.textSecondary} /> : null}
        </View>
      </View>

      {query.trim().length < 2 ? (
        <View className="px-4 mt-6">
          <Text className="text-white/55 text-[12px] uppercase tracking-wider mb-3">
            Quick picks
          </Text>
          {QUICK_PICKS.map((q) => (
            <Pressable
              key={q.label}
              onPress={() => setQuery(q.query || q.label)}
              className="bg-surface-1 rounded-2xl p-4 mb-2 border border-white/10 flex-row items-center"
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.surface2 }}
              >
                <SymbolView
                  name={q.icon as never}
                  tintColor={colors.text}
                  size={18}
                  fallback={null}
                />
              </View>
              <Text className="text-white text-[15px] font-medium ml-3 flex-1">
                {q.label}
              </Text>
              <SymbolView
                name="arrow.right"
                tintColor={colors.textTertiary}
                size={14}
                fallback={null}
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <FlatList
          data={features}
          keyExtractor={(f) => f.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => pick(item.place_name)}
              className="bg-surface-1 rounded-2xl p-4 mb-2 border border-white/10 flex-row items-center"
            >
              <SymbolView
                name="mappin.circle.fill"
                tintColor={colors.accent}
                size={22}
                fallback={null}
              />
              <View className="ml-3 flex-1">
                <Text className="text-white text-[15px] font-semibold">
                  {item.text}
                </Text>
                <Text
                  className="text-white/55 text-[12px] mt-0.5"
                  numberOfLines={1}
                >
                  {item.place_name}
                </Text>
              </View>
              <SymbolView
                name="arrow.right"
                tintColor={colors.textTertiary}
                size={14}
                fallback={null}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            !loading ? (
              <Text className="text-white/45 text-[13px] text-center mt-12">
                No matches — try another spelling.
              </Text>
            ) : null
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}
