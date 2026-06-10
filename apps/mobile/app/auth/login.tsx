import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const submitEmail = async () => {
    if (!email.includes("@")) {
      Alert.alert("Hmm", "That doesn't look like an email.");
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "walter://auth-callback" },
    });
    setSending(false);
    if (error) {
      Alert.alert("Couldn't send", error.message);
      return;
    }
    setSent(true);
  };

  const submitApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        Alert.alert("Apple Sign In", "Missing identity token.");
        return;
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }
      router.back();
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === "ERR_REQUEST_CANCELED") return;
      Alert.alert("Apple Sign In", err instanceof Error ? err.message : String(e));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.pageBg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          justifyContent: "center",
        }}
      >
        <View className="items-center mb-8">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-white text-[24px] font-black italic">W</Text>
          </View>
          <Text className="text-ink text-[24px] font-bold tracking-tight">
            Sign in to Walter
          </Text>
          <Text className="text-ink-soft text-[14px] mt-1 text-center">
            Save trips, sync across devices, share with the people you travel
            with.
          </Text>
        </View>

        {sent ? (
          <View
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: colors.surface1,
              borderColor: colors.accent,
            }}
          >
            <View className="flex-row items-center gap-2">
              <SymbolView
                name="checkmark.circle.fill"
                tintColor={colors.accent}
                size={20}
                fallback={null}
              />
              <Text className="text-ink text-[16px] font-semibold">
                Check your inbox
              </Text>
            </View>
            <Text className="text-ink-soft text-[13px] mt-2 leading-5">
              We sent a magic link to {email}. Tap it on this device to sign in.
            </Text>
            <Pressable
              onPress={() => router.back()}
              className="mt-4 py-3 rounded-full items-center"
              style={{ backgroundColor: colors.surface2 }}
            >
              <Text className="text-ink text-[14px] font-medium">Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {appleAvailable ? (
              <>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                  }
                  buttonStyle={
                    AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  cornerRadius={999}
                  style={{ height: 52, width: "100%" }}
                  onPress={submitApple}
                />
                <View className="flex-row items-center my-5">
                  <View className="flex-1 h-px bg-line-strong" />
                  <Text className="text-ink-faint text-[12px] mx-3">
                    or with email
                  </Text>
                  <View className="flex-1 h-px bg-line-strong" />
                </View>
              </>
            ) : null}

            <View className="bg-card rounded-2xl border border-line flex-row items-center px-4 py-3.5">
              <SymbolView
                name="envelope"
                tintColor={colors.textSecondary}
                size={18}
                fallback={null}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@walter.travel"
                placeholderTextColor={colors.textTertiary}
                className="flex-1 ml-3 text-ink text-[15px]"
              />
            </View>
            <Pressable
              onPress={submitEmail}
              disabled={sending || !email}
              className="mt-4 py-4 rounded-full items-center"
              style={{
                backgroundColor: email ? colors.accent : colors.surface2,
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: email ? "white" : colors.textTertiary }}
                >
                  Send magic link
                </Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
