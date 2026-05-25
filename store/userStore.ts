import { API } from "@/constants/constants";
import userService from "@/services/userService";
import {
  IUserDetail,
  IUserProfile,
  User,
} from "@/typings/interfaces/user/user";
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
  getUserProfile: () => Promise<IUserProfile | null>;
  createUserProfile: (data: Partial<IUserProfile>) => Promise<boolean>;
  updateUserProfile: (data: Partial<IUserProfile>) => Promise<boolean>;
  forgotPassword: (data: any) => Promise<boolean>;
  clearForgotResponse: () => void;
  UsersList: User[];
  getList: (query?: Record<string, string | number | null>) => Promise<void>;
}

export const useUserStore = create<UserState>()((set, get) => ({
  userDetail: null,
  userProfile: null,
  userForgotResponse: null,
  UsersList: [],

  fetchUserDetail: async () => {
    try {
      const response = await userService.getSingleWithOutSlug<IUserDetail>(
        API.USER.DETAIL,
      );

      if (response) {
        set({ userDetail: response });
      }
    } catch (error) {
      console.log("Error fetching user detail:", error);
    }
  },

  getUserProfile: async () => {
    try {
      const response = await userService.getSingleWithOutSlug<IUserProfile>(
        API.USER.PROFILE,
      );
      if (response) {
        set({ userProfile: response });
        return response;
      }
      set({ userProfile: null });
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  // The backend creates the profile during registration (POST /auth/register)
  // and exposes only PUT /api/user/profile. There is no create-profile route,
  // so "create" maps to the same update call against the existing profile.
  createUserProfile: async (data) => {
    const response = await userService.update<Partial<IUserProfile>>(
      API.USER.PROFILE,
      data,
    );
    return response;
  },

  updateUserProfile: async (data) => {
    const response = await userService.update<Partial<IUserProfile>>(
      API.USER.PROFILE,
      data,
    );
    return response;
  },

  // NOTE: the backend has no password-reset endpoint. This is intentionally a
  // no-op so the UI can surface a clear "not supported" message instead of
  // calling a route that does not exist. See ForgotPassword screen.
  forgotPassword: async (_data: any): Promise<boolean> => {
    console.warn("forgotPassword: backend has no password-reset endpoint.");
    return false;
  },

  clearForgotResponse: () => {
    set({ userForgotResponse: null });
  },

  getList: async (query) => {
    const response = await userService.getListWithPagination<User>(
      API.USER.LIST,
      query,
    );
    if (response) {
      set({ UsersList: response.data });
    }
  },
}));
