import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AirportAutocomplete } from "../components/AirportAutocomplete";
import { DateRangePicker } from "../components/DateRangePicker";
import { usePrefs } from "../lib/stores/walterPrefsStore";
import { colors } from "../theme/colors";

const ACCOMMODATIONS = [
  { id: "hotel", label: "Hotel", icon: "bed.double.fill", hint: "Reliable, full-service" },
  { id: "boutique", label: "Boutique", icon: "sparkles", hint: "Small, designed, local" },
  { id: "rental", label: "Rental", icon: "house.fill", hint: "Whole place, kitchen" },
  { id: "hostel", label: "Hostel", icon: "person.2.fill", hint: "Cheap, social" },
  { id: "surprise", label: "Surprise me", icon: "questionmark", hint: "Walter picks" },
];

export default function ClarifyScreen() {
  const prefs = usePrefs((s) => s.prefs);
  const patch = usePrefs((s) => s.patch);

  const [travelers, setTravelers] = useState<number>(prefs.travelers ?? 2);
  const [stay, setStay] = useState<string>(prefs.stay?.[0] ?? "hotel");
  const [departure, setDeparture] = useState<string>(prefs.departureCity ?? "");
  const [startDate, setStartDate] = useState<string | undefined>(prefs.startDate);
  const [endDate, setEndDate] = useState<string | undefined>(prefs.endDate);

  const continueDisabled = !departure.trim() || !startDate || !endDate;

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
    >
      <Text className="text-white/55 text-[13px] mb-6 leading-5">
        Three quick questions before Walter starts pulling itineraries.
        {prefs.destination ? ` Your pick: ${prefs.destination}.` : ""}
      </Text>

      {/* Dates */}
      <Section title="When" hint="Walter searches the whole window for the best fare.">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />
      </Section>

      {/* Travelers */}
      <Section title="Who's going" hint="Adults only — kids can come later.">
        <View className="bg-surface-1 rounded-2xl p-4 border border-white/10 flex-row items-center justify-between">
          <Text className="text-white text-[16px] font-medium">Travelers</Text>
          <View className="flex-row items-center gap-4">
            <StepperBtn
              onPress={() => {
                Haptics.selectionAsync();
                setTravelers((n) => Math.max(1, n - 1));
              }}
              icon="minus"
              disabled={travelers <= 1}
            />
            <Text className="text-white text-[20px] font-bold min-w-[24px] text-center">
              {travelers}
            </Text>
            <StepperBtn
              onPress={() => {
                Haptics.selectionAsync();
                setTravelers((n) => Math.min(12, n + 1));
              }}
              icon="plus"
              disabled={travelers >= 12}
            />
          </View>
        </View>
      </Section>

      {/* Accommodation */}
      <Section title="Where they stay" hint="One pick; refine later.">
        {ACCOMMODATIONS.map((a) => {
          const active = stay === a.id;
          return (
            <Pressable
              key={a.id}
              onPress={() => {
                Haptics.selectionAsync();
                setStay(a.id);
              }}
              className="bg-surface-1 rounded-2xl p-4 mb-2 border flex-row items-center"
              style={{
                borderColor: active ? colors.accent : colors.hairline,
                borderWidth: active ? 1.5 : 1,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: active ? colors.accent : colors.surface2 }}
              >
                <SymbolView
                  name={a.icon as never}
                  tintColor="white"
                  size={18}
                  fallback={null}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-white text-[15px] font-semibold">
                  {a.label}
                </Text>
                <Text className="text-white/55 text-[12px] mt-0.5">{a.hint}</Text>
              </View>
              {active ? (
                <SymbolView
                  name="checkmark.circle.fill"
                  tintColor={colors.accent}
                  size={22}
                  fallback={null}
                />
              ) : null}
            </Pressable>
          );
        })}
      </Section>

      {/* Departure */}
      <Section title="Leaving from" hint="City or airport — Walter will figure the rest.">
        <AirportAutocomplete value={departure} onChange={setDeparture} />
      </Section>

      <Pressable
        onPress={() => {
          patch({
            travelers,
            stay: [stay],
            departureCity: departure,
            startDate,
            endDate,
          });
          router.push("/compare");
        }}
        disabled={continueDisabled}
        className="mt-6 py-4 rounded-full items-center"
        style={{
          backgroundColor: continueDisabled
            ? colors.surface2
            : colors.accent,
        }}
      >
        <Text className="text-white text-[16px] font-semibold">
          Generate three options
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-8">
      <Text className="text-white text-[18px] font-bold tracking-tight">
        {title}
      </Text>
      {hint ? (
        <Text className="text-white/55 text-[12px] mt-0.5 mb-3">{hint}</Text>
      ) : (
        <View className="h-3" />
      )}
      {children}
    </View>
  );
}

function StepperBtn({
  onPress,
  icon,
  disabled,
}: {
  onPress: () => void;
  icon: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-9 h-9 rounded-full items-center justify-center"
      style={{
        backgroundColor: colors.surface2,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <SymbolView
        name={icon as never}
        tintColor="white"
        size={14}
        fallback={null}
      />
    </Pressable>
  );
}
