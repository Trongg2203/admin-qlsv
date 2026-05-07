import { ThemeMode, themeTokens, useThemeStore } from "@/store/themeStore";
import { scale } from "@/utils/responsive";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const OPTIONS: { mode: ThemeMode; label: string; hint: string }[] = [
  { mode: "dark", label: "Che do toi", hint: "Nen den, hien thi sang" },
  { mode: "light", label: "Che do sang", hint: "Nen trang, de nhin" },
  { mode: "system", label: "Theo he thong", hint: "Tu dong theo cai dat may" },
];

export default function AppSetting() {
  const { themeMode, resolvedTheme, setThemeMode } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cai dat giao dien</Text>
        <Text style={styles.headerSubTitle}>
          Lua chon che do den hoac trang cho toan bo ung dung
        </Text>
      </View>

      <View style={styles.card}>
        {OPTIONS.map((option) => {
          const active = themeMode === option.mode;
          return (
            <TouchableOpacity
              key={option.mode}
              style={[styles.optionRow, active && styles.optionRowActive]}
              onPress={() => setThemeMode(option.mode)}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionHint}>{option.hint}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.background,
      padding: scale(16),
    },
    header: {
      marginBottom: scale(20),
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: tokens.text,
    },
    headerSubTitle: {
      marginTop: scale(6),
      color: tokens.subtext,
      fontSize: 12,
    },
    card: {
      backgroundColor: tokens.surface,
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: tokens.border,
      overflow: "hidden",
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: scale(14),
      paddingHorizontal: scale(14),
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    },
    optionRowActive: {
      backgroundColor: tokens.accentSoft,
    },
    optionLabel: {
      color: tokens.text,
      fontSize: 14,
      fontWeight: "600",
    },
    optionHint: {
      marginTop: scale(4),
      color: tokens.subtext,
      fontSize: 11,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: tokens.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioActive: {
      borderColor: tokens.accent,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: tokens.accent,
    },
  });
