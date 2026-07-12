import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { colors } from "../theme/colors";

/*
 * Loading bar as a flight: the plane makes one pass, decelerating as it
 * nears the far end (a progress feel, not a loop), pulling a cornflower
 * contrail behind it. Mirror of apps/web/components/PlaneLoader.tsx.
 */
export function PlaneLoader({
  width = 220,
  durationMs = 14000,
}: {
  width?: number;
  durationMs?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* One flight, easing out toward ~96%; the component unmounts when
     * loading ends. */
    const flight = Animated.timing(t, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.bezier(0.1, 0.6, 0.3, 1),
      useNativeDriver: false,
    });
    flight.start();
    return () => flight.stop();
  }, [t, durationMs]);

  const PLANE = 20;
  const track = (width - PLANE) * 0.96;
  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, track],
  });
  const contrailWidth = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, track],
  });

  return (
    <View style={{ width, height: PLANE, justifyContent: "center" }}>
      {/* faint track */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: "rgba(91, 141, 239, 0.15)",
        }}
      />
      {/* contrail */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: colors.accent,
          width: contrailWidth,
        }}
      />
      {/* the plane */}
      <Animated.View
        style={{ position: "absolute", transform: [{ translateX }, { translateY: 1 }] }}
      >
        <SymbolView
          name="airplane"
          tintColor={colors.accent}
          size={PLANE}
          fallback={null}
        />
      </Animated.View>
    </View>
  );
}
