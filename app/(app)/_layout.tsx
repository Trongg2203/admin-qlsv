import { Tabs, Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { House, User, Settings, CalendarCheck2 } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { useUserStore } from "@/store/userStore";

export default function AppLayout() {
  const { isLoggedIn } = useAuthStore();
  const { fetchUserDetail } = useUserStore();

  // chưa login → về login
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#6B4EFF",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          href: "/HomeScreen",
          tabBarIcon: ({ color }) => <House size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="DailyScreen"
        options={{
          title: "Daily",
          href: "/DailyScreen",
          tabBarIcon: ({ color }) => <CalendarCheck2 size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          href: "/ProfileScreen",
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 70,
    paddingBottom: 10,
    borderTopWidth: 0,
    elevation: 10,
    backgroundColor: "#fff",
  },
});
