import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { DateRangePicker } from "../components/DateRangePicker";
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

function Card({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-card rounded-3xl border border-line p-5 mb-3">
      <View className="flex-row items-center gap-2 mb-3">
        <SymbolView
          name={icon as never}
          tintColor={colors.accent}
          size={16}
          fallback={null}
        />
        <Text className="text-ink-faint text-[12px] font-semibold uppercase tracking-wider">
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

export default function SearchScreen() {
  const prefs = usePrefs((s) => s.prefs);

  const [destination, setDestination] = useState(prefs.destination ?? "");
  const [query, setQuery] = useState(prefs.destination ?? "");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searching, setSearching] = useState(false);
  const [startDate, setStartDate] = useState(prefs.startDate ?? "");
  const [endDate, setEndDate] = useState(prefs.endDate ?? "");
  const [travelers, setTravelers] = useState(prefs.travelers ?? 2);
  const [description, setDescription] = useState(prefs.description ?? "");
  const abortRef = useRef<AbortController | null>(null);

  /* Suggestions only while the typed text differs from the chosen place. */
  useEffect(() => {
    if (query.trim().length < 2 || query === destination || !MAPBOX_TOKEN) {
      setFeatures([]);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?types=place,region,country&limit=4&access_token=${MAPBOX_TOKEN}`,
          { signal: controller.signal }
        );
        const data = await resp.json();
        setFeatures(data.features ?? []);
      } catch (e) {
        if (!(e instanceof Error && e.name === "AbortError"))
          console.warn("geocode failed", e);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, destination]);

  const canSearch = destination.trim().length > 0;

  const submit = () => {
    if (!canSearch) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    usePrefs.getState().patch({
      destination: destination.trim(),
      startDate,
      endDate,
      travelers,
      description: description.trim(),
    });
    router.replace("/compare");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.pageBg }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {/* Where */}
        <Card label="Where" icon="mappin.and.ellipse">
          <View
            className="rounded-2xl flex-row items-center px-4 py-3"
            style={{ backgroundColor: colors.surface2 }}
          >
            <SymbolView
              name="magnifyingglass"
              tintColor={colors.textSecondary}
              size={16}
              fallback={null}
            />
            <TextInput
              value={query}
              onChangeText={(v) => {
                setQuery(v);
                if (v !== destination) setDestination("");
              }}
              placeholder="City, country, or region"
              placeholderTextColor={colors.textTertiary}
              className="flex-1 ml-3 text-ink text-[15px]"
              autoCorrect={false}
              autoCapitalize="words"
            />
            {searching ? (
              <ActivityIndicator color={colors.textSecondary} />
            ) : null}
          </View>
          {features.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => {
                setDestination(f.place_name);
                setQuery(f.place_name);
                setFeatures([]);
              }}
              className="flex-row items-center py-3 border-b border-line last:border-b-0"
            >
              <SymbolView
                name="mappin.circle.fill"
                tintColor={colors.accent}
                size={18}
                fallback={null}
              />
              <Text
                className="text-ink text-[14px] ml-2.5 flex-1"
                numberOfLines={1}
              >
                {f.place_name}
              </Text>
            </Pressable>
          ))}
        </Card>

        {/* When */}
        <Card label="When" icon="calendar">
          <DateRangePicker
            startDate={startDate || undefined}
            endDate={endDate || undefined}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />
        </Card>

        {/* Who */}
        <Card label="Who" icon="person.2.fill">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-ink text-[15px] font-semibold">
                Travelers
              </Text>
              <Text className="text-ink-faint text-[12px] mt-0.5">
                Everyone making the trip
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() => setTravelers((n) => Math.max(1, n - 1))}
                disabled={travelers <= 1}
                hitSlop={8}
                className="w-9 h-9 rounded-full border items-center justify-center"
                style={{
                  borderColor:
                    travelers <= 1 ? colors.hairline : colors.hairlineStrong,
                }}
              >
                <Text
                  className="text-[18px]"
                  style={{
                    color: travelers <= 1 ? colors.textTertiary : colors.text,
                  }}
                >
                  −
                </Text>
              </Pressable>
              <Text className="text-ink text-[17px] font-semibold w-6 text-center">
                {travelers}
              </Text>
              <Pressable
                onPress={() => setTravelers((n) => Math.min(10, n + 1))}
                disabled={travelers >= 10}
                hitSlop={8}
                className="w-9 h-9 rounded-full border items-center justify-center"
                style={{ borderColor: colors.hairlineStrong }}
              >
                <Text className="text-ink text-[18px]">+</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        {/* What */}
        <Card label="What" icon="sparkles">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What do you love? Comedy shows, live sports, street food, museums..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            className="text-ink text-[15px] leading-5"
            style={{ minHeight: 64, textAlignVertical: "top" }}
          />
        </Card>

        <Pressable
          onPress={submit}
          disabled={!canSearch}
          className="mt-3 py-4 rounded-full items-center flex-row justify-center gap-2"
          style={{
            backgroundColor: canSearch ? colors.accent : colors.surface2,
          }}
        >
          <SymbolView
            name="magnifyingglass"
            tintColor={canSearch ? "white" : colors.textTertiary}
            size={16}
            fallback={null}
          />
          <Text
            className="text-[16px] font-semibold"
            style={{ color: canSearch ? "white" : colors.textTertiary }}
          >
            Search
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
