import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { usePrefs } from "../../lib/stores/walterPrefsStore";
import { colors } from "../../theme/colors";

const EXAMPLES = [
  "Jazz weekend under $2k",
  "Somewhere warm in January",
  "Comedy shows and barbecue",
  "Mountains, no cell service",
];

export default function QuickScreen() {
  const [text, setText] = useState("");
  const ready = text.trim().length >= 3;

  const go = () => {
    if (!ready) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    usePrefs.getState().patch({
      destination: "",
      description: text.trim(),
      vibes: [],
      startDate: "",
      endDate: "",
    });
    router.push("/compare");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.pageBg }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <Text
          className="text-ink font-semibold"
          style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.4 }}
        >
          Tell Walter anything.
        </Text>
        <Text className="text-ink-soft text-[14px] mt-2 leading-5">
          One line. He turns it into three real trips.
        </Text>

        <View className="bg-card rounded-3xl border border-line p-4 mt-6">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="A long weekend with live music and great tacos..."
            placeholderTextColor={colors.textTertiary}
            multiline
            className="text-ink text-[16px] leading-6"
            style={{ minHeight: 88, textAlignVertical: "top" }}
          />
        </View>

        <View className="flex-row flex-wrap gap-2 mt-4">
          {EXAMPLES.map((ex) => (
            <Pressable
              key={ex}
              onPress={() => setText(ex)}
              className="px-3.5 py-2 rounded-full border"
              style={{ borderColor: colors.hairlineStrong }}
            >
              <Text className="text-ink-soft text-[13px] font-medium">{ex}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={go}
          disabled={!ready}
          className="mt-6 py-4 rounded-full items-center flex-row justify-center gap-2"
          style={{ backgroundColor: ready ? colors.accent : colors.surface2 }}
        >
          <SymbolView
            name="sparkles"
            tintColor={ready ? "white" : colors.textTertiary}
            size={16}
            fallback={null}
          />
          <Text
            className="text-[16px] font-semibold"
            style={{ color: ready ? "white" : colors.textTertiary }}
          >
            Get three trips
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
