import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, StyleSheet } from "react-native";

import { colors } from "../../theme/colors";

type TabIconProps = { focused: boolean; sfSymbol: string; size?: number };

function TabIcon({ focused, sfSymbol, size = 26 }: TabIconProps) {
  return (
    <SymbolView
      name={sfSymbol as never}
      type={focused ? "hierarchical" : "monochrome"}
      tintColor={focused ? colors.accent : colors.textTertiary}
      size={size}
      resizeMode="scaleAspectFit"
      fallback={null}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          position: Platform.OS === "ios" ? "absolute" : "relative",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          backgroundColor:
            Platform.OS === "ios" ? "transparent" : colors.pageBg,
        },
        tabBarBackground:
          Platform.OS === "ios"
            ? () => (
                <BlurView
                  tint="light"
                  intensity={80}
                  style={StyleSheet.absoluteFill}
                />
              )
            : undefined,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerStyle: { backgroundColor: colors.pageBg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        sceneStyle: { backgroundColor: colors.pageBg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} sfSymbol="magnifyingglass" />
          ),
        }}
      />
      {/* Folded into the Explore home; hidden from the bar. */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Wishlists",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} sfSymbol="heart.fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} sfSymbol="person.crop.circle.fill" />
          ),
        }}
      />
    </Tabs>
  );
}
