import { API } from "@/constants/constants";
import userService from "@/services/userService";
import { IUserDetail, IUserProfile } from "@/typings/interfaces/user/user";
import { create } from "zustand";

interface IUserForgotResponse {
  email: string;
  password: string;
}

interface UserState {
  userDetail: IUserDetail | null;
  userProfile: IUserProfile | null;
  userForgotResponse: IUserForgotResponse | null;
  fetchUserDetail: () => Promise<void>;
  getUserProfile: () => Promise<void>;
  forgotPassword: (data: any) => Promise<boolean>;
  clearForgotResponse: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  userDetail: null,
  userProfile: null,
  userForgotResponse: null,

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

  forgotPassword: async (data: any): Promise<boolean> => {
    try {
      const response = await userService.create<any, any>(
        API.USER.FORGOT_PASSWORD,
        data,
      );

      if (response) {
        const email = response?.email || data.email;
        set({
          userForgotResponse: {
            email,
            password: data.new_password,
          },
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error occurred while resetting password:", error);
      return false;
    }
  },

  clearForgotResponse: () => {
    set({ userForgotResponse: null });
  },
}));
