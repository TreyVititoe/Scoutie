import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

/* AsyncStorage rejections (disk full, corrupted store) otherwise surface as
 * unhandled promise rejections and the write is silently lost. */
export const safeStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name).catch(() => null),
  setItem: (name, value) =>
    AsyncStorage.setItem(name, value).catch((err) =>
      console.warn(`persist write failed for ${name}`, err)
    ),
  removeItem: (name) => AsyncStorage.removeItem(name).catch(() => {}),
};
