import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  startDate?: string;
  endDate?: string;
  onChange: (start: string, end: string) => void;
};

function fmtDate(iso?: string): string {
  if (!iso) return "Pick a date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function DateRangePicker({ startDate, endDate, onChange }: Props) {
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);

  const startDateObj = useMemo(
    () => (startDate ? new Date(startDate) : new Date()),
    [startDate]
  );

  const endDateObj = useMemo(() => {
    if (endDate) return new Date(endDate);
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + 5);
      return d;
    }
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d;
  }, [endDate, startDate]);

  const minEnd = useMemo(() => {
    const d = new Date(startDate ?? Date.now());
    d.setDate(d.getDate() + 1);
    return d;
  }, [startDate]);

  const nights =
    startDate && endDate
      ? Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <View>
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setActiveField("start");
          }}
          className="flex-1 bg-surface-1 rounded-2xl border border-white/10 p-4"
          style={
            activeField === "start"
              ? { borderColor: colors.accent, borderWidth: 1.5 }
              : null
          }
        >
          <View className="flex-row items-center gap-2 mb-1">
            <SymbolView
              name="calendar"
              tintColor={colors.textSecondary}
              size={14}
              fallback={null}
            />
            <Text className="text-white/55 text-[11px] uppercase tracking-wider">
              Start
            </Text>
          </View>
          <Text className="text-white text-[15px] font-semibold">
            {fmtDate(startDate)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setActiveField("end");
          }}
          className="flex-1 bg-surface-1 rounded-2xl border border-white/10 p-4"
          style={
            activeField === "end"
              ? { borderColor: colors.accent, borderWidth: 1.5 }
              : null
          }
        >
          <View className="flex-row items-center gap-2 mb-1">
            <SymbolView
              name="calendar"
              tintColor={colors.textSecondary}
              size={14}
              fallback={null}
            />
            <Text className="text-white/55 text-[11px] uppercase tracking-wider">
              End
            </Text>
          </View>
          <Text className="text-white text-[15px] font-semibold">
            {fmtDate(endDate)}
          </Text>
        </Pressable>
      </View>

      {nights > 0 ? (
        <Text className="text-white/55 text-[12px] mt-2 text-center">
          {nights} {nights === 1 ? "night" : "nights"}
        </Text>
      ) : null}

      <Modal
        visible={activeField !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveField(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setActiveField(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-surface-1 rounded-t-3xl pt-3 pb-8 px-4 border-t border-white/10"
          >
            <View className="w-10 h-1 bg-white/30 rounded-full self-center mb-4" />
            <Text className="text-white text-[18px] font-bold tracking-tight mb-2">
              {activeField === "start" ? "Start date" : "End date"}
            </Text>
            <DateTimePicker
              value={activeField === "start" ? startDateObj : endDateObj}
              mode="date"
              display="inline"
              themeVariant="dark"
              minimumDate={activeField === "end" ? minEnd : new Date()}
              accentColor={colors.accent}
              textColor={colors.text}
              onChange={(_event, date) => {
                if (!date) return;
                Haptics.selectionAsync();
                if (activeField === "start") {
                  const iso = toISO(date);
                  let endIso = endDate;
                  if (!endIso || new Date(endIso) <= date) {
                    const e = new Date(date);
                    e.setDate(e.getDate() + 5);
                    endIso = toISO(e);
                  }
                  onChange(iso, endIso);
                } else {
                  onChange(startDate ?? toISO(new Date()), toISO(date));
                }
              }}
            />
            <Pressable
              onPress={() => setActiveField(null)}
              className="mt-3 py-3.5 rounded-full items-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="text-white text-[15px] font-semibold">Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
