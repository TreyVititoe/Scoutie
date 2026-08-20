import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";

/* Floating pill bar holding four equal filled circles: dark gray with white
 * icons, turning accent blue when selected. */
const TAB_ORDER = ["index", "saved", "quick", "chat"] as const;
const TAB_META: Record<string, { icon: string; label: string }> = {
  index: { icon: "house.fill", label: "Home" },
  saved: { icon: "suitcase.fill", label: "Trips" },
  quick: { icon: "sparkles", label: "Quick plan" },
  chat: { icon: "message.fill", label: "Chat" },
};

const BAR = 68;
/* Circles fill the bar's height; the pill hugs them edge to edge. */
const CIRCLE = 60;
const CIRCLE_BG = "#404042";

/* Untyped on purpose: BottomTabBarProps lives in a transitive dep. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const routes = TAB_ORDER.map((name) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.routes.find((r: any) => r.name === name)
  ).filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pressHandler = (route: any, focused: boolean) => () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!focused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

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
        className="flex-row items-center justify-between bg-card rounded-full border border-line"
        style={{
          height: BAR,
          paddingHorizontal: (BAR - CIRCLE) / 2,
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
          return (
            <Pressable
              key={route.key}
              onPress={pressHandler(route, focused)}
              accessibilityRole="tab"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: focused }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: BAR,
              }}
            >
              <View
                style={{
                  width: CIRCLE,
                  height: CIRCLE,
                  borderRadius: CIRCLE / 2,
                  backgroundColor: focused ? colors.accent : CIRCLE_BG,
                  alignItems: "center",
                  justifyContent: "center",
                  ...(focused
                    ? {
                        shadowColor: colors.accent,
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                      }
                    : null),
                }}
              >
                <SymbolView
                  name={meta.icon as never}
                  tintColor="white"
                  size={25}
                  fallback={null}
                />
              </View>
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
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="saved" options={{ title: "Trips" }} />
      <Tabs.Screen name="quick" options={{ title: "Quick" }} />
      <Tabs.Screen name="chat" options={{ headerShown: false }} />
      {/* Folded into the Explore home; hidden from the bar. */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      {/* Accounts are parked; the screen stays reachable by code only. */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
