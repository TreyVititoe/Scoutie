import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";

/* Floating pill bar with a raised circular Home in the center. */
const TAB_ORDER = ["quick", "index", "saved"] as const;
const TAB_META: Record<string, { icon: string; label: string }> = {
  quick: { icon: "sparkles", label: "Quick" },
  index: { icon: "house.fill", label: "Home" },
  saved: { icon: "suitcase.fill", label: "Trips" },
};

/* Untyped on purpose: BottomTabBarProps lives in a transitive dep. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const routes = TAB_ORDER.map((name) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.routes.find((r: any) => r.name === name)
  ).filter(Boolean);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: insets.bottom + 6,
      }}
    >
      <View
        className="flex-row items-center justify-around bg-card rounded-full border border-line"
        style={{
          height: 64,
          shadowColor: colors.shadow,
          shadowOpacity: 0.16,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {routes.map((route: any) => {
          const focused = state.index === state.routes.indexOf(route);
          const meta = TAB_META[route.name];
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === "index") {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{ alignItems: "center", marginTop: -30 }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: colors.accent,
                    shadowOpacity: 0.45,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 5 },
                  }}
                >
                  <SymbolView
                    name="house.fill"
                    tintColor="white"
                    size={24}
                    fallback={null}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    marginTop: 4,
                    color: focused ? colors.accent : colors.textTertiary,
                  }}
                >
                  Home
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 64,
                minWidth: 72,
              }}
            >
              <SymbolView
                name={meta.icon as never}
                tintColor={focused ? colors.accent : colors.textTertiary}
                size={22}
                fallback={null}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  marginTop: 3,
                  color: focused ? colors.accent : colors.textTertiary,
                }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.pageBg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        sceneStyle: { backgroundColor: colors.pageBg },
      }}
    >
      <Tabs.Screen name="quick" options={{ title: "Quick" }} />
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="saved" options={{ title: "Trips" }} />
      {/* Folded into the Explore home; hidden from the bar. */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      {/* Accounts are parked; the screen stays reachable by code only. */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
