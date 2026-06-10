import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";

import { colors } from "../theme/colors";

type Feature = {
  id: string;
  place_name: string;
  text: string;
  place_type: string[];
  properties?: { category?: string };
  center?: [number, number];
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";

export function AirportAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!focused || query.trim().length < 2 || !MAPBOX_TOKEN) {
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
          )}.json?types=place,poi&limit=6&access_token=${MAPBOX_TOKEN}`,
          { signal: controller.signal }
        );
        const data = await resp.json();
        const feats: Feature[] = data.features ?? [];
        setFeatures(
          feats.filter(
            (f) =>
              f.place_type.includes("place") ||
              f.properties?.category?.includes("airport")
          )
        );
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
  }, [query, focused]);

  return (
    <View>
      <View className="bg-card rounded-2xl border border-line flex-row items-center px-4 py-3.5">
        <SymbolView
          name="airplane"
          tintColor={colors.textSecondary}
          size={18}
          fallback={null}
        />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            onChange(t);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder ?? "City or airport"}
          placeholderTextColor={colors.textTertiary}
          className="flex-1 ml-3 text-ink text-[15px]"
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading ? <ActivityIndicator color={colors.textSecondary} /> : null}
      </View>

      {focused && features.length > 0 ? (
        <View className="bg-card mt-2 rounded-2xl border border-line overflow-hidden">
          <FlatList
            data={features}
            keyExtractor={(f) => f.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isAirport = item.properties?.category?.includes("airport");
              return (
                <Pressable
                  onPress={() => {
                    setQuery(item.place_name);
                    onChange(item.place_name);
                    setFocused(false);
                    setFeatures([]);
                  }}
                  className="px-4 py-3 flex-row items-center gap-3 border-b border-line"
                >
                  <SymbolView
                    name={isAirport ? "airplane" : "mappin"}
                    tintColor={colors.textSecondary}
                    size={16}
                    fallback={null}
                  />
                  <View className="flex-1">
                    <Text className="text-ink text-[14px] font-medium">
                      {item.text}
                    </Text>
                    <Text className="text-ink-faint text-[12px]" numberOfLines={1}>
                      {item.place_name}
                    </Text>
                  </View>
                  {isAirport ? (
                    <View className="bg-accent/20 px-2 py-0.5 rounded">
                      <Text className="text-accent text-[10px] font-semibold">
                        Airport
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
