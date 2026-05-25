import { themeTokens, useThemeStore } from "@/store/themeStore";
import { useMemo } from "react";
import { Text, View } from "react-native";

export default function Statistics() {
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(
    () => ({
      container: {
        flex: 1,
        padding: 24,
        backgroundColor: tokens.background,
      },
      title: {
        fontSize: 22,
        fontWeight: "700",
        color: tokens.text,
        marginBottom: 10,
      },
      subtitle: {
        fontSize: 14,
        color: tokens.subtext,
      },
    }),
    [tokens],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê</Text>
      <Text style={styles.subtitle}>
        Trang thống kê đang được nâng cấp. Dữ liệu thống kê sẽ sớm có ở đây.
      </Text>
    </View>
  );
}
