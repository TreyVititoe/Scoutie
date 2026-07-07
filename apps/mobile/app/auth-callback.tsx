import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme/colors";

/*
 * Lands here from magic-link emails (walter://auth-callback). Supabase
 * puts session tokens in the URL fragment (implicit flow) or a
 * token_hash in the query, depending on template; handle both.
 */
function parseAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const collect = (chunk: string) => {
    for (const pair of chunk.split("&")) {
      const [k, ...rest] = pair.split("=");
      if (k && rest.length)
        params[decodeURIComponent(k)] = decodeURIComponent(rest.join("="));
    }
  };
  const hashIdx = url.indexOf("#");
  if (hashIdx >= 0) collect(url.slice(hashIdx + 1));
  const query = url.slice(
    url.indexOf("?") + 1,
    hashIdx >= 0 ? hashIdx : undefined
  );
  if (url.includes("?")) collect(query);
  return params;
}

export default function AuthCallbackScreen() {
  const url = Linking.useLinkingURL();
  const handled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || handled.current) return;
    handled.current = true;

    (async () => {
      const params = parseAuthParams(url);

      if (params.error_description || params.error) {
        setError(params.error_description || params.error);
        return;
      }

      if (params.access_token && params.refresh_token) {
        const { error: err } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (err) return setError(err.message);
        router.replace("/(tabs)/profile");
        return;
      }

      if (params.token_hash) {
        const { error: err } = await supabase.auth.verifyOtp({
          token_hash: params.token_hash,
          type: (params.type as "email" | "magiclink") || "email",
        });
        if (err) return setError(err.message);
        router.replace("/(tabs)/profile");
        return;
      }

      setError("That sign-in link is missing its token. Request a new one.");
    })();
  }, [url]);

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
      {error ? (
        <>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Sign-in didn't stick
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => router.replace("/auth/login")}
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
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.accent} />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: 16,
            }}
          >
            Signing you in…
          </Text>
        </>
      )}
    </View>
  );
}
