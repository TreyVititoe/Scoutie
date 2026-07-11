import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import { colors } from "../theme/colors";

/*
 * Native take on the ldrs LineWobble loader the web app uses: a rounded
 * bar sweeping side to side inside a faint track.
 */
export function LineWobble({
  width = 220,
  stroke = 5,
}: {
  width?: number;
  stroke?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 875,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 875,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const barWidth = width * 0.4;
  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - barWidth],
  });

  return (
    <View
      style={{
        width,
        height: stroke,
        borderRadius: stroke / 2,
        backgroundColor: "rgba(91, 141, 239, 0.15)",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          width: barWidth,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: colors.accent,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}
