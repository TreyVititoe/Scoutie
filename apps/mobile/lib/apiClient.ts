import { configureApiClient } from "@walter/api-client";

export function bootApiClient() {
  const baseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://scoutie.vercel.app";
  configureApiClient({ baseUrl });
}

export { api } from "@walter/api-client";
