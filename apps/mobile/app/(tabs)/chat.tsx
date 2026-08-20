import type { TripPrefs } from "@walter/shared";
import { api } from "@walter/api-client";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
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
  activeMessages,
  threadLabel,
  useWalterChat,
  type ChatMessage,
} from "../../lib/stores/walterChatStore";
import { colors } from "../../theme/colors";

const OPENERS = [
  "Plan me a beach week in March",
  "Where should I eat in Rome?",
  "Best month for Tokyo?",
];

/* iMessage-familiar gray for Walter's side of the conversation. */
const WALTER_BUBBLE = "#E9E9EB";

function shortDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* Walter bolds key phrases with **double asterisks**; render them heavy. */
function BoldableText({
  text,
  color,
}: {
  text: string;
  color: string;
}) {
  const parts = text.split("**");
  return (
    <Text style={{ color, fontSize: 15, lineHeight: 21 }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={{ fontWeight: "800" }}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

function TripProposalCard({ trip }: { trip: Partial<TripPrefs> }) {
  const photo = api.photo.url(trip.destination ?? "travel");
  const nights =
    trip.startDate && trip.endDate
      ? Math.max(
          1,
          Math.round(
            (Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86400000
          )
        )
      : null;

  const facts: { icon: string; label: string; value: string }[] = [
    {
      icon: "calendar",
      label: "When",
      value:
        trip.startDate && trip.endDate
          ? `${shortDate(trip.startDate)} to ${shortDate(trip.endDate)}${nights ? ` · ${nights} nights` : ""}`
          : "Dates flexible",
    },
    {
      icon: "person.2.fill",
      label: "Who",
      value:
        (trip.travelers ?? 0) > 1 ? `${trip.travelers} travelers` : "Solo trip",
    },
  ];
  if (trip.departureCity || trip.departureAirportCode) {
    facts.push({
      icon: "airplane.departure",
      label: "From",
      value: trip.departureAirportCode
        ? `${trip.departureCity ?? "Departure"} (${trip.departureAirportCode})`
        : (trip.departureCity as string),
    });
  }
  if ((trip.budget ?? 0) > 0) {
    facts.push({
      icon: "dollarsign.circle.fill",
      label: "Budget",
      value: `$${(trip.budget as number).toLocaleString()} for the group`,
    });
  }

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
      className="bg-card rounded-3xl mt-2 overflow-hidden"
      style={{
        shadowColor: colors.shadow,
        shadowOpacity: 0.2,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <View style={{ height: 150 }}>
        <Image
          source={{ uri: photo }}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", height: "100%", backgroundColor: "#404042" }}
        />
        <LinearGradient
          colors={["transparent", "rgba(10, 14, 24, 0.85)"]}
          locations={[0.25, 1]}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
          className="px-4 pb-3"
        >
          <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
            Your trip is ready
          </Text>
          <Text
            className="text-white text-[24px] font-bold"
            style={{ letterSpacing: -0.4 }}
            numberOfLines={1}
          >
            {trip.destination}
          </Text>
        </View>
      </View>

      <View className="px-4 pt-3 pb-1">
        {facts.map((f) => (
          <View key={f.label} className="flex-row items-center gap-2.5 py-1.5">
            <SymbolView
              name={f.icon as never}
              tintColor={colors.accent}
              size={15}
              fallback={null}
            />
            <Text className="text-ink-soft text-[12px] font-semibold w-14">
              {f.label}
            </Text>
            <Text className="text-ink text-[14px] font-medium flex-1" numberOfLines={1}>
              {f.value}
            </Text>
          </View>
        ))}
        {trip.vibes?.length ? (
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {trip.vibes.slice(0, 4).map((v) => (
              <View
                key={v}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: colors.surface2 }}
              >
                <Text className="text-ink text-[11px] font-semibold capitalize">
                  {v}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {trip.description ? (
          <Text className="text-ink-faint text-[12px] mt-2" numberOfLines={2}>
            {trip.description}
          </Text>
        ) : null}
      </View>

      <View
        className="flex-row items-center justify-center gap-2 py-3.5 mx-4 mb-4 mt-2 rounded-full"
        style={{ backgroundColor: colors.accent }}
      >
        <Text className="text-white text-[15px] font-bold">
          Open live flights and stays
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
  const threads = useWalterChat((s) => s.threads);
  const activeId = useWalterChat((s) => s.activeId);
  const messages = useWalterChat(activeMessages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = (animated = true) =>
    scrollRef.current?.scrollToEnd({ animated });

  useEffect(() => {
    /* New message, Walter typing, or images loading all grow the content;
     * follow the bottom like a messages app. */
    const t = setTimeout(() => scrollToEnd(), 60);
    return () => clearTimeout(t);
  }, [messages.length, busy]);

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
      const history = activeMessages(useWalterChat.getState())
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
        <View className="flex-row items-end justify-between">
          <View>
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
          {/* Little conversation tabs: one dot per chat, plus a new-chat + */}
          <View className="flex-row items-center gap-1.5 pb-1">
            {threads.map((t, i) => {
              const active = t.id === activeId;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => useWalterChat.getState().setActive(t.id)}
                  accessibilityRole="tab"
                  accessibilityLabel={`Chat ${i + 1}`}
                  accessibilityState={{ selected: active }}
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: active ? colors.accent : colors.surface3,
                  }}
                >
                  <Text
                    className="text-[11px] font-bold"
                    style={{ color: active ? "#FFFFFF" : colors.text }}
                  >
                    {threadLabel(t, i)}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => useWalterChat.getState().newThread()}
              accessibilityRole="button"
              accessibilityLabel="New chat"
              className="items-center justify-center rounded-full border border-line"
              style={{ width: 30, height: 30 }}
            >
              <SymbolView
                name="plus"
                tintColor={colors.textTertiary}
                size={13}
                fallback={null}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollToEnd(false)}
      >
        {messages.length === 0 ? (
          <View>
            <View
              className="rounded-2xl p-4 self-start"
              style={{ maxWidth: "88%", backgroundColor: WALTER_BUBBLE }}
            >
              <BoldableText
                color={colors.text}
                text={
                  "Where are we headed? Tell me a **place**, a **month**, or just a mood — I will take it from there. When the trip sounds right, I will put the whole thing together for you."
                }
              />
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
                className="rounded-2xl p-3.5"
                style={{
                  maxWidth: "88%",
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    m.role === "user" ? colors.accent : WALTER_BUBBLE,
                }}
              >
                <BoldableText
                  color={m.role === "user" ? "#FFFFFF" : colors.text}
                  text={m.content}
                />
              </View>
              {m.trip?.destination ? <TripProposalCard trip={m.trip} /> : null}
            </View>
          ))
        )}
        {busy ? (
          <View
            className="rounded-2xl px-4 py-3 self-start flex-row items-center gap-2.5"
            style={{ backgroundColor: WALTER_BUBBLE }}
          >
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
          onFocus={() => setTimeout(() => scrollToEnd(), 250)}
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
