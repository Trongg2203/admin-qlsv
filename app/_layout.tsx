import { Stack } from "expo-router";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Platform } from "react-native";
import GlobalLoading from "./components/UI/GlobalLoading";
import ToastManager from "toastify-react-native/components/ToastManager";

export default function RootLayout() {
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Chỉ lock trên iOS và Android, web thì bỏ qua
        if (Platform.OS !== "web") {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT,
          );
          console.log("Đã khóa xoay màn hình");
        }
      } catch (error) {
        console.log("Không thể khóa xoay:", error);
        // Thử cách khác: chỉ lock portrait-up thay vì portrait
        try {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP,
          );
        } catch (e) {
          console.log("Vẫn không khóa được:", e);
        }
      }
    };

    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <GlobalLoading />
      <ToastManager
        position="top" // 'top', 'bottom'
        duration={3000}
      />
    </>
  );
}
