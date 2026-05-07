import { themeTokens, useThemeStore } from "@/store/themeStore";
import { scale } from "@/utils/responsive";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens.background), [tokens]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const createStyles = (backgroundColor: string) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor,
    },
    container: {
      flex: 1,
      paddingTop: scale(16),
      paddingHorizontal: scale(16),
      paddingBottom: scale(20),
    },
  });
