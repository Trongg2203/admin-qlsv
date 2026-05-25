import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack, router, usePathname } from "expo-router";
import {
  ArrowLeft,
  LogOut,
  MonitorSmartphone,
  PanelLeft,
  Utensils,
  Users,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

const NAV_ITEMS = [
  {
    label: "Món ăn",
    route: "/ProductManagement",
    icon: Utensils,
  },
  {
    label: "Người dùng",
    route: "/UserManagement",
    icon: Users,
  },
];

export default function AdminLayout() {
  const { isLoggedIn, is_admin, logout, user_type } = useAuthStore();
  const pathname = usePathname();

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  if (!is_admin || user_type !== 1) {
    return <Redirect href="/(app)/DailyScreen" />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/LoginScreen");
  };

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <PanelLeft size={20} color="#eff6ff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Admin Control</Text>
            <Text style={styles.brandSubtitle}>Quản trị hệ thống</Text>
          </View>
        </View>

        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.includes(item.route.replace("/", ""));
            return (
              <Pressable
                key={item.route}
                onPress={() => router.replace(item.route as never)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <Icon size={18} color={active ? "#eff6ff" : "#94a3b8"} />
                <Text
                  style={[
                    styles.navText,
                    active && styles.navTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => router.replace("/(app)/DailyScreen")}
            style={styles.switchButton}
          >
            <MonitorSmartphone size={18} color="#dbeafe" />
            <Text style={styles.switchText}>Giao diện user</Text>
          </Pressable>

          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color="#fecaca" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={18} color="#334155" />
            <Text style={styles.backText}>Quay lại</Text>
          </Pressable>
          <Text style={styles.topbarTitle}>Khu vực quản trị</Text>
        </View>
        <View style={styles.stackWrap}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProductManagement" />
            <Stack.Screen name="UserManagement" />
            <Stack.Screen name="AddOrEditProduct" />
            <Stack.Screen name="addOrEditUser" />
          </Stack>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#eef2f7",
  },
  sidebar: {
    width: 268,
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 22,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  brandSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  navList: {
    flex: 1,
    gap: 6,
  },
  navItem: {
    minHeight: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  navItemActive: {
    backgroundColor: "#2563eb",
  },
  navText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#eff6ff",
  },
  footer: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  switchButton: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  switchText: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "700",
  },
  logoutButton: {
    minHeight: 42,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: "#fecaca",
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    height: 56,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 16,
  },
  backButton: {
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  topbarTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  stackWrap: {
    flex: 1,
    minHeight: 0,
  },
});
