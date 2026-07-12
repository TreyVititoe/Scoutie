import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Mapbox from "@rnmapbox/maps";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";
import { bootApiClient } from "../lib/apiClient";
import { colors } from "../theme/colors";

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.pageBg,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <SymbolView
        name="exclamationmark.triangle.fill"
        tintColor={colors.textTertiary}
        size={40}
        fallback={null}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Something snapped a twig
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          marginTop: 8,
          textAlign: "center",
          lineHeight: 20,
        }}
        numberOfLines={4}
      >
        {error.message || "Unknown error"}
      </Text>
      <Pressable
        onPress={() => {
          retry();
        }}
        style={{
          marginTop: 24,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 999,
          backgroundColor: colors.accent,
        }}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? null);

SystemUI.setBackgroundColorAsync(colors.pageBg);

export default function RootLayout() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  useEffect(() => {
    bootApiClient();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.pageBg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.pageBg },
              headerTintColor: colors.text,
              headerLargeTitleStyle: { color: colors.text },
              headerTitleStyle: { color: colors.text },
              contentStyle: { backgroundColor: colors.pageBg },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="search"
              options={{
                presentation: "modal",
                title: "Plan a trip",
              }}
            />
            <Stack.Screen
              name="clarify"
              options={{
                presentation: "modal",
                title: "A few details",
                headerLargeTitle: true,
              }}
            />
            <Stack.Screen
              name="compare"
              options={{ title: "Three ways to go", headerLargeTitle: true }}
            />
            <Stack.Screen
              name="results/index"
              options={{ title: "Build your trip", headerLargeTitle: true }}
            />
            <Stack.Screen
              name="trip/index"
              options={{ title: "Your trip", headerLargeTitle: true }}
            />
            <Stack.Screen
              name="checkout"
              options={{ title: "Book your trip", headerLargeTitle: true }}
            />
            <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth/login"
              options={{ presentation: "modal", title: "Sign in" }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
