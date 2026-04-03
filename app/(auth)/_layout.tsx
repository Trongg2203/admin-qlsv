import { Stack } from "expo-router";

import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";
import GlobalLoading from "../components/UI/GlobalLoading";
import { useUserStore } from "@/store/userStore";

export default function AuthLayout() {
  const { isLoggedIn } = useAuthStore();
  const { getUserProfile } = useUserStore();

  if (isLoggedIn) {
    getUserProfile();
    return <Redirect href="/(app)/ProfileScreen" />;
  }
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
      <GlobalLoading />
    </>
  );
}
