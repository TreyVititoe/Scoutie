import { CATEGORY_LABELS, CATEGORY_ORDER, CURATED_TRIPS } from "@walter/shared";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useRef } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TripCard } from "../../components/TripCard";
import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const SIDE = 20;
const HERO_IMG = require("../../assets/home-hero.jpg");
/* assets/home-hero.jpg is 853x1844 */
const HERO_ASPECT = 1844 / 853;
/* The scenery outruns the page: reverse parallax. */
const PARALLAX = 1.35;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

function shortDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const prefs = usePrefs((s) => s.prefs);
  // Two cards across with a sliver of the third peeking, Airbnb-style.
  const cardWidth = Math.round((width - SIDE * 2 - 14) / 2.08);

  const rails = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        key: cat,
        label: CATEGORY_LABELS[cat],
        trips: CURATED_TRIPS.filter((t) => t.category === cat),
      })).filter((r) => r.trips.length > 0),
    []
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const imgH = Math.round(width * HERO_ASPECT);
  const translateY = Animated.multiply(scrollY, -PARALLAX);

  const whenValue =
    prefs.startDate && prefs.endDate
      ? `${shortDate(prefs.startDate)} to ${shortDate(prefs.endDate)}`
      : "Anytime";
  const whoValue =
    (prefs.travelers ?? 0) > 1 ? `${prefs.travelers} travelers` : "Just me";

  const searchRows = [
    {
      icon: "mappin.and.ellipse",
      q: "Where to?",
      v: prefs.destination ? prefs.destination.split(",")[0] : "Anywhere",
    },
    { icon: "calendar", q: "When?", v: whenValue },
    { icon: "person.2.fill", q: "Who's coming?", v: whoValue },
    {
      icon: "sparkles",
      q: "What are you into?",
      v: prefs.description?.trim() || "Anything unforgettable",
    },
  ];

  return (
    <View className="flex-1 bg-page-bg">
      {/* Parallax scenery: pinned behind the page, scrolling faster */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: imgH,
          transform: [{ translateY }],
        }}
      >
        <Image
          source={HERO_IMG}
          contentFit="cover"
          style={{ width: "100%", height: imgH }}
        />
        <LinearGradient
          colors={["transparent", colors.pageBg]}
          locations={[0.62, 0.96]}
          style={{ position: "absolute", inset: 0 }}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
      >
        <View style={{ paddingTop: insets.top + 10 }} className="px-5">
          {/* Wordmark over the sky */}
          <View className="flex-row items-center gap-2.5">
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 30, height: 30, borderRadius: 8 }}
            />
            <Text className="text-ink text-[18px] font-semibold tracking-tight">
              Walter
            </Text>
          </View>

          {/* Invitation */}
          <View style={{ marginTop: 88 }}>
            <Text className="text-white/90 text-[15px] font-semibold">
              {greeting()}
            </Text>
            <Text
              className="text-white"
              style={{
                fontFamily: "Georgia",
                fontSize: 46,
                lineHeight: 52,
                fontWeight: "600",
                marginTop: 6,
              }}
            >
              Adventure{"\n"}is calling.
            </Text>
            <Text className="text-white/85 text-[15px] mt-3 leading-5">
              Let&apos;s plan something unforgettable.
            </Text>
          </View>

          {/* Search summary card: every row opens the sheet */}
          <View
            className="bg-card rounded-[28px] mt-8 p-2"
            style={{
              shadowColor: colors.shadow,
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            {searchRows.map((row, i) => (
              <Pressable
                key={row.q}
                onPress={() => router.push("/search")}
                className={`flex-row items-center gap-3.5 px-3.5 py-3.5 ${
                  i < searchRows.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <View
                  className="w-11 h-11 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.surface2 }}
                >
                  <SymbolView
                    name={row.icon as never}
                    tintColor={colors.text}
                    size={18}
                    fallback={null}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-ink text-[16px] font-semibold">
                    {row.q}
                  </Text>
                  <Text
                    className="text-ink-soft text-[13px] mt-0.5"
                    numberOfLines={1}
                  >
                    {row.v}
                  </Text>
                </View>
                <SymbolView
                  name="chevron.right"
                  tintColor={colors.textTertiary}
                  size={14}
                  fallback={null}
                />
              </Pressable>
            ))}
            <Pressable
              onPress={() => router.push("/search")}
              className="mx-2 mt-2 mb-2 py-4 rounded-full items-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="text-white text-[16px] font-semibold">
                Plan My Adventure
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Rails on solid ground */}
        <View className="bg-page-bg mt-10 pt-2">
          {rails.map((rail) => (
            <View key={rail.key} className="mb-7">
              <View className="px-5 mb-3 flex-row items-center justify-between">
                <Text
                  className="text-ink text-[21px] font-bold tracking-tight flex-1 mr-3"
                  numberOfLines={1}
                >
                  {rail.label}
                </Text>
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.surface2 }}
                >
                  <SymbolView
                    name="arrow.right"
                    tintColor={colors.text}
                    size={15}
                    fallback={null}
                  />
                </View>
              </View>
              <FlatList
                data={rail.trips}
                keyExtractor={(t) => t.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SIDE, gap: 14 }}
                renderItem={({ item }) => (
                  <TripCard
                    trip={item}
                    width={cardWidth}
                    onPress={() => {
                      usePrefs.getState().patch({
                        destination: item.destination,
                        durationDays: item.durationDays,
                      });
                      router.push("/clarify");
                    }}
                  />
                )}
              />
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
