import { themeTokens, useThemeStore } from "@/store/themeStore";
import { useMemo } from "react";
import { Text, View } from "react-native";

export default function ReportManagement() {
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
      <Text style={styles.title}>Quản lý báo cáo</Text>
      <Text style={styles.subtitle}>
        Trang quản lý báo cáo đang được xây dựng. Bạn có thể xem dữ liệu báo cáo
        ở đây.
      </Text>
    </View>
  );
}
