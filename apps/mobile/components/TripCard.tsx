import type { CuratedTrip } from "@walter/shared";
import { api } from "@walter/api-client";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  trip: CuratedTrip;
  onPress?: () => void;
  /** Image (and card) width. The image is square; text flows beneath. */
  width?: number;
};

/**
 * Airbnb-style card: a rounded square photo carrying a badge + a save heart,
 * with the title and price set in dark text below the image.
 */
export function TripCard({ trip, onPress, width = 168 }: Props) {
  const [saved, setSaved] = useState(false);
  const photoUrl =
    trip.image ?? api.photo.url(trip.photoQuery ?? trip.destination);

  return (
    <Pressable onPress={onPress} style={{ width }}>
      <View
        style={{
          width,
          height: width,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: colors.surface2,
        }}
      >
        <Image
          source={{ uri: photoUrl }}
          contentFit="cover"
          transition={300}
          style={{ position: "absolute", inset: 0 }}
        />

        {trip.tier ? (
          <View
            className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1"
            style={{
              shadowColor: colors.shadow,
              shadowOpacity: 0.16,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text className="text-ink text-[11px] font-semibold">
              {trip.tier}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => setSaved((s) => !s)}
          hitSlop={10}
          className="absolute right-2 top-2"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
          }}
        >
          <SymbolView
            name={saved ? "heart.fill" : "heart"}
            tintColor={saved ? colors.accent : "white"}
            size={26}
            fallback={null}
          />
        </Pressable>
      </View>

      <Text
        className="text-ink text-[15px] font-semibold leading-[19px] mt-2"
        numberOfLines={2}
      >
        {trip.title}
      </Text>
      <Text className="text-ink-soft text-[13px] mt-0.5" numberOfLines={1}>
        From ${trip.totalCost.toLocaleString()} · {trip.durationDays} days
      </Text>
    </Pressable>
  );
}
