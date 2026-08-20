import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "../../theme/colors";

/*
 * One horizontally scrolling row of filter chips per group, stacked per
 * section. Single-select groups pass value/onChange; the airline group
 * multi-selects through values/onToggle.
 */

export type Chip<V> = { value: V; label: string };

export function ChipRow<V extends string | number | null>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Chip<V>[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <View className="flex-row items-center mb-2">
      <Text
        className="text-[10px] font-bold uppercase tracking-wider w-[74px]"
        style={{ color: colors.textTertiary }}
      >
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingRight: 16 }}
        className="flex-1"
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: active ? colors.text : "transparent",
                borderColor: active ? colors.text : colors.hairlineStrong,
              }}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{ color: active ? "white" : colors.textSecondary }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function MultiChipRow({
  label,
  options,
  values,
  onToggle,
  max = 8,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  max?: number;
}) {
  if (options.length < 2) return null;
  return (
    <View className="flex-row items-center mb-2">
      <Text
        className="text-[10px] font-bold uppercase tracking-wider w-[74px]"
        style={{ color: colors.textTertiary }}
      >
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingRight: 16 }}
        className="flex-1"
      >
        {options.slice(0, max).map((o) => {
          const active = values.includes(o);
          return (
            <Pressable
              key={o}
              onPress={() => onToggle(o)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: active ? colors.text : "transparent",
                borderColor: active ? colors.text : colors.hairlineStrong,
              }}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{ color: active ? "white" : colors.textSecondary }}
              >
                {o}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function FilterPanel({
  children,
  activeCount,
  onReset,
}: {
  children: React.ReactNode;
  activeCount: number;
  onReset: () => void;
}) {
  return (
    <View className="mb-3">
      {children}
      {activeCount > 0 ? (
        <Pressable onPress={onReset} accessibilityRole="button" className="ml-[74px]">
          <Text
            className="text-[12px] font-semibold underline"
            style={{ color: colors.textSecondary }}
          >
            Reset filters
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
