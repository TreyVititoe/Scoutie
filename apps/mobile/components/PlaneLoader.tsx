import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { colors } from "../theme/colors";

/*
 * Loading bar as a flight: a little plane sweeps the track and pulls a
 * cornflower contrail behind it, then banks back for another pass.
 * Mirror of apps/web/components/PlaneLoader.tsx.
 */
export function PlaneLoader({ width = 220 }: { width?: number }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const PLANE = 20;
  const track = width - PLANE;
  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, track],
  });
  const contrailWidth = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, track],
  });
  const opacity = t.interpolate({
    inputRange: [0, 0.06, 0.94, 1],
    outputRange: [0, 1, 1, 0],
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
          opacity,
        }}
      />
      {/* the plane */}
      <Animated.View
        style={{
          position: "absolute",
          transform: [{ translateX }],
          opacity,
        }}
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
