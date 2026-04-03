import { API } from "@/constants/constants";
import userService from "@/services/userService";
import { IUserDetail, IUserProfile } from "@/typings/interfaces/user/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  userDetail: IUserDetail | null;
  userProfile: IUserProfile | null;
  fetchUserDetail: () => Promise<void>;
  getUserProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>()((set, get) => ({
  userDetail: null,
  userProfile: null,

  fetchUserDetail: async () => {
    try {
      const response = await userService.getSingle<IUserDetail>(
        API.USER.DETAIL,
        "",
      );

      if (response) {
        console.log("User detail fetched successfully:", response);
        set({ userDetail: response });
      } else {
        console.log("No user detail data");
      }
    } catch (error) {
      console.log("Error fetching user detail:", error);
    }
  },

  getUserProfile: async () => {
    try {
      const response = await userService.getSingle<IUserProfile>(
        API.USER.PROFILE,
        "",
      );
      if (response) set({ userProfile: response });
    } catch (error) {
      console.log(error);
    }
  },
}));
