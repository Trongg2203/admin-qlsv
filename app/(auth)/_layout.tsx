import { useAuthStore } from "@/store/authStore";
import { resolveEntryRoute } from "@/utils/sessionFlow";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  const { isLoggedIn } = useAuthStore();

  // If an already-authenticated user lands back on the auth stack (e.g. a
  // restored route), send them onward via the onboarding resolver instead of
  // hard-redirecting to DailyScreen (which used to bypass profile/goal setup).
  useEffect(() => {
    if (isLoggedIn) {
      resolveEntryRoute().then((route) => router.replace(route));
    }
  }, [isLoggedIn]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="register" />
      <Stack.Screen name="ForgotPassword" />
    </Stack>
  );
}
