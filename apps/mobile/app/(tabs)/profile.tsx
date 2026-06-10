import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useSession } from "../../lib/hooks/useSession";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

export default function ProfileScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <View className="flex-1 bg-page-bg" />;
  }

  if (!session) {
    return (
      <View className="flex-1 bg-page-bg items-center justify-center px-8">
        <SymbolView
          name="person.crop.circle"
          tintColor={colors.textTertiary}
          size={56}
          fallback={null}
        />
        <Text className="text-ink text-[22px] font-bold mt-5 tracking-tight">
          Sign in to Walter
        </Text>
        <Text className="text-ink-soft text-[14px] text-center mt-2 leading-5">
          Save trips across devices and share them with the people you travel
          with.
        </Text>
        <Pressable
          onPress={() => router.push("/auth/login")}
          className="mt-6 px-8 py-3.5 rounded-full"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white text-[15px] font-semibold">
            Continue
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
    >
      <View className="bg-card rounded-2xl p-5 border border-line">
        <Text className="text-ink-faint text-[12px] uppercase tracking-wider">
          Signed in as
        </Text>
        <Text className="text-ink text-[18px] font-semibold mt-1">
          {session.user.email}
        </Text>
      </View>

      <Pressable
        onPress={async () => {
          await supabase.auth.signOut();
          Alert.alert("Signed out");
        }}
        className="mt-4 bg-card rounded-2xl p-4 border border-line flex-row items-center justify-between"
      >
        <Text className="text-ink text-[15px] font-medium">Sign out</Text>
        <SymbolView
          name="rectangle.portrait.and.arrow.right"
          tintColor={colors.textSecondary}
          size={18}
          fallback={null}
        />
      </Pressable>
    </ScrollView>
  );
}
