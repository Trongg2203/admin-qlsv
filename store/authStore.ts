import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "@/services/authService";
import { AUTH_TOKEN_NAME, AUTH_TOKEN_REMEMBER } from "@/constants/constants";
import { useErrorStore } from "./errorStore";

interface User {
  id: string;
  name: string;
}

interface AuthState {
  user_type: number;
  is_admin: boolean;
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user_type: 0,
      is_admin: false,
      user: null,
      isLoggedIn: false,
      loading: false,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });

          const res = await authService.login({ email, password });

          if (res.code === 200) {
            set({
              token: res.data.access_token,
              isLoggedIn: true,
              is_admin: res.data.is_admin,
              user_type: res.data.user_type,
              loading: false,
            });

            await AsyncStorage.setItem(AUTH_TOKEN_NAME, res.data.access_token);
            await AsyncStorage.setItem(AUTH_TOKEN_REMEMBER, "true");

            return true;
          }

          if (res.code === 401) {
            useErrorStore.getState().setError(res.message || "Unauthorized");
          }

          return false;
        } catch (error) {
          set({ loading: false });
          console.log("Login error:", error);
          return false; // ❗ không throw nữa, để UI handle
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          const response = await authService.logout();
          if (response.code === 200) {
            set({
              token: null,
              user: null,
              isLoggedIn: false,
              user_type: 0,
              is_admin: false,
            });
          } else if (response.code === 401 || response.code === 500) {
            set({
              token: null,
              user: null,
              isLoggedIn: false,
              user_type: 0,
              is_admin: false,
            });
          }
        } catch (error) {
          console.log(error);
        } finally {
          await AsyncStorage.removeItem(AUTH_TOKEN_NAME);
          await AsyncStorage.removeItem(AUTH_TOKEN_REMEMBER);
          set({ loading: false });
        }
        // persist middleware sẽ tự động xóa khỏi AsyncStorage
      },
    }),
    {
      name: "auth-storage", // key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ định những field nào cần persist
      partialize: (state) => ({
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        is_admin: state.is_admin,
        user_type: state.user_type,
        // Không persist loading state
      }),
    },
  ),
);
