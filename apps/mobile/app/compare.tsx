import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PlaneLoader } from "../components/PlaneLoader";
import { SkeletonCard } from "../components/Skeleton";
import { api } from "../lib/apiClient";
import { usePrefs } from "../lib/stores/walterPrefsStore";
import { colors } from "../theme/colors";

export default function CompareScreen() {
  const prefs = usePrefs((s) => s.prefs);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["compare", prefs],
    queryFn: () =>
      api.compare.generate({
        destination: prefs.destination ?? "",
        startDate: prefs.startDate ?? "",
        endDate: prefs.endDate ?? "",
        travelers: prefs.travelers ?? 2,
        travelersType: prefs.travelersType ?? "couple",
        budget: prefs.budget ?? 0,
        budgetType: prefs.budgetType ?? "total",
        vibes: prefs.vibes ?? [],
        stay: prefs.stay ?? [],
        description: prefs.description ?? "",
      }),
    enabled: !!prefs.destination,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <ScrollView
        className="flex-1 bg-page-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        <View className="items-center py-5">
          <PlaneLoader durationMs={22000} />
        </View>
        <Text className="text-ink-soft text-[13px] mb-5 leading-5 text-center">
          Walter is scouting three angles on {prefs.destination ?? "your trip"}…
        </Text>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-page-bg items-center justify-center px-8">
        <SymbolView
          name="exclamationmark.triangle.fill"
          tintColor={colors.textTertiary}
          size={36}
          fallback={null}
        />
        <Text className="text-ink text-[16px] font-semibold mt-4 text-center">
          Couldn't reach Walter
        </Text>
        <Text className="text-ink-soft text-[13px] mt-2 text-center">
          {String((error as Error).message)}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="mt-5 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white text-[14px] font-semibold">
            {isRefetching ? "Retrying…" : "Try again"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
    >
      <Text className="text-ink-soft text-[13px] mb-5 leading-5">
        Three takes on {prefs.destination}. Pick one and Walter will lay out
        the rest.
      </Text>

      {(data?.trips ?? []).map((tier, i) => (
        <Pressable
          key={`${tier.tier}-${i}`}
          onPress={() => {
            usePrefs.getState().patch({
              destination: tier.destination || prefs.destination,
              devotion:
                tier.tier === "ambitious"
                  ? "ambitious"
                  : tier.tier === "comfortable"
                  ? "casual"
                  : "balanced",
              budget: tier.totalCost ?? 0,
            });
            router.push("/results");
          }}
          className="bg-card rounded-3xl overflow-hidden border border-line mb-4"
        >
          {tier.image || tier.destination ? (
            <Image
              source={{
                uri: tier.image ?? api.photo.url(tier.destination),
              }}
              contentFit="cover"
              style={{ width: "100%", height: 160 }}
            />
          ) : (
            <View
              style={{ height: 160, backgroundColor: colors.surface2 }}
              className="items-center justify-center"
            >
              <SymbolView
                name="photo"
                tintColor={colors.textTertiary}
                size={32}
                fallback={null}
              />
            </View>
          )}
          <View className="p-5">
            <Text className="text-accent text-[11px] font-bold uppercase tracking-wider">
              {tier.tier}
            </Text>
            <Text className="text-ink text-[22px] font-bold tracking-tight mt-1">
              {tier.title}
            </Text>
            {tier.destination ? (
              <View className="flex-row items-center gap-1 mt-1">
                <SymbolView
                  name="mappin"
                  tintColor={colors.textSecondary}
                  size={12}
                  fallback={null}
                />
                <Text className="text-ink-soft text-[13px] font-medium">
                  {tier.destination}
                </Text>
              </View>
            ) : null}
            <Text className="text-ink-soft text-[14px] mt-2 leading-5">
              {tier.summary}
            </Text>
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-ink text-[18px] font-bold">
                ${(tier.totalCost ?? 0).toLocaleString()}
              </Text>
              <View
                className="px-3.5 py-2 rounded-full flex-row items-center gap-1.5"
                style={{ backgroundColor: colors.accent }}
              >
                <Text className="text-white text-[13px] font-semibold">
                  Build this
                </Text>
                <SymbolView
                  name="arrow.right"
                  tintColor="white"
                  size={12}
                  fallback={null}
                />
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
