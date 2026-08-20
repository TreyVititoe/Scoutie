import type { TripPrefs } from "@walter/shared";
import { api } from "@walter/api-client";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePrefs } from "../../lib/stores/walterPrefsStore";
import {
  useWalterChat,
  type ChatMessage,
} from "../../lib/stores/walterChatStore";
import { colors } from "../../theme/colors";

const OPENERS = [
  "Plan me a beach week in March",
  "Where should I eat in Rome?",
  "Best month for Tokyo?",
];

function shortDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function TripProposalCard({ trip }: { trip: Partial<TripPrefs> }) {
  const when =
    trip.startDate && trip.endDate
      ? `${shortDate(trip.startDate)} to ${shortDate(trip.endDate)}`
      : "Dates flexible";
  const who =
    (trip.travelers ?? 0) > 1 ? `${trip.travelers} travelers` : "Solo";

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    usePrefs.getState().patch({
      destination: trip.destination ?? "",
      startDate: trip.startDate ?? "",
      endDate: trip.endDate ?? "",
      travelers: trip.travelers ?? 2,
      budget: trip.budget ?? 0,
      vibes: trip.vibes ?? [],
      description: trip.description ?? "",
      departureCity: trip.departureCity ?? "",
      departureAirportCode: trip.departureAirportCode ?? "",
    });
    router.push("/results");
  };

  return (
    <Pressable
      onPress={open}
      className="bg-card rounded-2xl border border-line mt-2 overflow-hidden"
      style={{
        shadowColor: colors.shadow,
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <View className="p-4">
        <Text className="text-ink-faint text-[11px] font-semibold uppercase tracking-wider">
          Trip ready
        </Text>
        <Text className="text-ink text-[18px] font-bold mt-1" numberOfLines={1}>
          {trip.destination}
        </Text>
        <Text className="text-ink-soft text-[13px] mt-1">
          {when} · {who}
        </Text>
      </View>
      <View
        className="flex-row items-center justify-center gap-2 py-3"
        style={{ backgroundColor: colors.accent }}
      >
        <Text className="text-white text-[15px] font-semibold">
          Open this trip
        </Text>
        <SymbolView
          name="arrow.right"
          tintColor="white"
          size={14}
          fallback={null}
        />
      </View>
    </Pressable>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const messages = useWalterChat((s) => s.messages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft("");
    setError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    useWalterChat.getState().add(userMsg);
    setBusy(true);
    try {
      const history = [...useWalterChat.getState().messages]
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));
      const result = await api.chat.send({ messages: history });
      useWalterChat.getState().add({
        id: `a-${Date.now()}`,
        role: "assistant",
        content: result.reply,
        trip: result.trip,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Walter stepped away for a moment. Try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.pageBg }}
    >
      <View
        className="px-5 pb-3 border-b border-line"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Text
          className="text-ink font-semibold"
          style={{ fontSize: 28, letterSpacing: -0.3 }}
        >
          Walter
        </Text>
        <Text className="text-ink-soft text-[13px] mt-0.5">
          Your travel concierge. Ask him anything.
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View>
            <View className="bg-card rounded-2xl border border-line p-4 self-start" style={{ maxWidth: "88%" }}>
              <Text className="text-ink text-[15px] leading-[21px]">
                Where are we headed? Tell me a place, a month, or just a mood
                — I will take it from there. When the trip sounds right, I
                will put the whole thing together for you.
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-4">
              {OPENERS.map((o) => (
                <Pressable
                  key={o}
                  onPress={() => send(o)}
                  className="bg-card border border-line rounded-full px-4 py-2.5"
                >
                  <Text className="text-ink text-[13px] font-medium">{o}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          messages.map((m) => (
            <View key={m.id} className="mb-3">
              <View
                className={
                  m.role === "user"
                    ? "rounded-2xl p-3.5 self-end"
                    : "bg-card rounded-2xl border border-line p-3.5 self-start"
                }
                style={{
                  maxWidth: "88%",
                  ...(m.role === "user"
                    ? { backgroundColor: colors.accent }
                    : null),
                }}
              >
                <Text
                  className={
                    m.role === "user"
                      ? "text-white text-[15px] leading-[21px]"
                      : "text-ink text-[15px] leading-[21px]"
                  }
                >
                  {m.content}
                </Text>
              </View>
              {m.trip?.destination ? <TripProposalCard trip={m.trip} /> : null}
            </View>
          ))
        )}
        {busy ? (
          <View className="bg-card rounded-2xl border border-line px-4 py-3 self-start flex-row items-center gap-2.5">
            <ActivityIndicator size="small" color={colors.textTertiary} />
            <Text className="text-ink-soft text-[13px]">
              Walter is thinking
            </Text>
          </View>
        ) : null}
        {error ? (
          <View className="mt-2 self-start">
            <Text className="text-[13px]" style={{ color: "#B4483E" }}>
              {error}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        className="flex-row items-end gap-2.5 px-4 pt-2 border-t border-line bg-page-bg"
        style={{ paddingBottom: insets.bottom + 86 }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message Walter"
          placeholderTextColor={colors.textTertiary}
          multiline
          className="flex-1 bg-card border border-line rounded-3xl px-4 text-ink text-[15px]"
          style={{ maxHeight: 110, paddingTop: 12, paddingBottom: 12 }}
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={!draft.trim() || busy}
          className="items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            backgroundColor:
              draft.trim() && !busy ? colors.accent : colors.surface3,
          }}
          accessibilityLabel="Send message"
        >
          <SymbolView
            name="arrow.up"
            tintColor="white"
            size={18}
            fallback={null}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
