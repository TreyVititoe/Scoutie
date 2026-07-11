import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet } from "react-native";

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
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          backgroundColor: colors.surface1,
        },
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
