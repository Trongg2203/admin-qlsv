import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "@/services/authService";
import {
  API,
  AUTH_TOKEN_NAME,
  AUTH_TOKEN_REMEMBER,
} from "@/constants/constants";
import { IUserDetail } from "@/typings/interfaces/user/user";
import { useUserStore } from "./userStore";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user_type: 0,
      is_admin: false,
      user: null,
      isLoggedIn: false,
      loading: false,
      userDetail: null,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const res = await authService.login({ email, password });

          if (res?.data) {
            set({
              token: res.data.access_token,
              isLoggedIn: true,
              is_admin: res.data.is_admin,
              user_type: res.data.user_type,
              loading: false,
            });

            AsyncStorage.setItem(AUTH_TOKEN_NAME, res.data.access_token);
            AsyncStorage.setItem(AUTH_TOKEN_REMEMBER, "true");

            console.log("Login successful:", res.data.access_token);
          }
        } catch (error) {
          set({ loading: false });
          console.log("Login error:", error);
          throw error;
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
          }
        } catch (error) {
          console.log(error);
        } finally {
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
