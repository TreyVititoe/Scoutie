import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View
      className="flex-row p-1 rounded-full"
      style={{ backgroundColor: colors.surface2 }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-1 py-2 rounded-full items-center"
            style={{
              backgroundColor: active ? colors.surface3 : "transparent",
            }}
          >
            <Text
              className="text-[13px] font-medium"
              style={{ color: active ? colors.text : colors.textSecondary }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
