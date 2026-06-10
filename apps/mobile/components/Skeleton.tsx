import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { View, type DimensionValue, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: Props) {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
    return () => cancelAnimation(x);
  }, [x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 300 }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: "rgba(35,43,63,0.07)",
        },
        style,
      ]}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.55)",
            "rgba(255,255,255,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-card rounded-3xl overflow-hidden border border-line mb-4">
      <Skeleton height={160} radius={0} />
      <View style={{ padding: 20 }}>
        <Skeleton width="40%" height={11} />
        <View style={{ height: 10 }} />
        <Skeleton width="80%" height={22} />
        <View style={{ height: 12 }} />
        <Skeleton width="100%" height={13} />
        <View style={{ height: 6 }} />
        <Skeleton width="60%" height={13} />
        <View
          style={{
            height: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Skeleton width={70} height={18} />
          <Skeleton width={100} height={32} radius={999} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View className="bg-card rounded-2xl p-4 mb-3 border border-line">
      <Skeleton width="70%" height={15} />
      <View style={{ height: 6 }} />
      <Skeleton width="50%" height={12} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <Skeleton width={70} height={16} />
        <Skeleton width={70} height={28} radius={999} />
      </View>
    </View>
  );
}
