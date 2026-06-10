import type { CuratedTrip } from "@walter/shared";
import { api } from "@walter/api-client";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View, Text } from "react-native";

type Props = {
  trip: CuratedTrip;
  onPress?: () => void;
  width?: number;
};

export function TripCard({ trip, onPress, width = 260 }: Props) {
  const photoUrl = trip.image ?? api.photo.url(trip.photoQuery ?? trip.destination);

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl overflow-hidden bg-surface-1 border border-white/10"
      style={{ width, height: 320 }}
    >
      <Image
        source={{ uri: photoUrl }}
        contentFit="cover"
        transition={300}
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220 }}
      />
      <View className="absolute inset-0 p-4 flex justify-between">
        <View className="flex-row items-center gap-1.5 self-start bg-black/40 px-2.5 py-1 rounded-full">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <Text className="text-white text-[11px] font-medium tracking-tight">
            {trip.destination}
          </Text>
        </View>

        <View>
          {trip.tier ? (
            <Text className="text-white/80 text-[11px] font-semibold uppercase tracking-wider mb-2">
              {trip.tier}
            </Text>
          ) : null}
          <Text
            className="text-white text-[20px] font-semibold leading-tight"
            numberOfLines={2}
          >
            {trip.title}
          </Text>
          <Text className="text-white/70 text-[13px] mt-1.5" numberOfLines={2}>
            {trip.description}
          </Text>
          <View className="flex-row gap-3 mt-3">
            <Text className="text-white/60 text-[12px]">
              {trip.durationDays} days
            </Text>
            <Text className="text-white/60 text-[12px]">·</Text>
            <Text className="text-white/60 text-[12px]">
              from ${trip.totalCost.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
