import { Stack } from "expo-router";

import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

export default function AuthLayout() {
  const { isLoggedIn } = useAuthStore();
  const { getUserProfile } = useUserStore();

  useEffect(() => {
    if (isLoggedIn) {
      // Gọi API khi đã logged in
      getUserProfile();
    }
  }, [isLoggedIn]);

  if (isLoggedIn) {
    // getUserProfile();
    return <Redirect href="/(app)/DailyScreen" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
