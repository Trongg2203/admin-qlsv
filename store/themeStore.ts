import { AsyncStorage } from "@/utils/storage";
import { Appearance } from "react-native";
import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

const THEME_MODE_KEY = "APP_THEME_MODE";

const resolveTheme = (mode: ThemeMode, systemTheme: ResolvedTheme) =>
  mode === "system" ? systemTheme : mode;

const getSystemTheme = (): ResolvedTheme =>
  Appearance.getColorScheme() === "dark" ? "dark" : "light";

export const themeTokens = {
  dark: {
    background: "#0B0B0D",
    surface: "#141417",
    card: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    glass: "rgba(20,20,24,0.7)",
    text: "#F5F6FA",
    subtext: "#9EA0A9",
    accent: "#7CFF6B",
    accentSoft: "rgba(124,255,107,0.12)",
    error: "#FF453A",        // Đã thêm - màu đỏ cho iOS dark mode
    danger: "#FF3B30",       // Giữ lại cho tương thích ngược
    disabled: "rgba(255,255,255,0.12)",
    nav: "rgba(20,20,24,0.9)",
  },
  light: {
    background: "#F7F7FB",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    border: "rgba(16,17,20,0.08)",
    glass: "rgba(255,255,255,0.9)",
    text: "#101114",
    subtext: "#5B5F6B",
    accent: "#6B4EFF",
    accentSoft: "rgba(107,78,255,0.12)",
    error: "#E11D48",       // Đã thêm - màu đỏ cho light mode
    danger: "#E11D48",      // Giữ lại cho tương thích ngược
    disabled: "#E5E7EB",
    nav: "rgba(255,255,255,0.95)",
  },
} as const;

interface ThemeState {
  themeMode: ThemeMode;
  systemTheme: ResolvedTheme;
  resolvedTheme: ResolvedTheme;
  hydrateTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setSystemTheme: (theme: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: "dark",
  systemTheme: getSystemTheme(),
  resolvedTheme: resolveTheme("dark", getSystemTheme()),
  hydrateTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (stored === "dark" || stored === "light" || stored === "system") {
        const systemTheme = getSystemTheme();
        set({
          themeMode: stored,
          systemTheme,
          resolvedTheme: resolveTheme(stored, systemTheme),
        });
      }
    } catch (error) {
      console.log("hydrateTheme error", error);
    }
  },
  setThemeMode: async (mode) => {
    const systemTheme = get().systemTheme;
    set({ themeMode: mode, resolvedTheme: resolveTheme(mode, systemTheme) });
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.log("setThemeMode error", error);
    }
  },
  setSystemTheme: (theme) => {
    const mode = get().themeMode;
    set({ systemTheme: theme, resolvedTheme: resolveTheme(mode, theme) });
  },
}));