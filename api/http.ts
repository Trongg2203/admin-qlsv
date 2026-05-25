import {
  API,
  AUTH_TOKEN_NAME,
  AUTH_TOKEN_REMEMBER,
} from "@/constants/constants";
import { LoggedIn } from "@/typings/interfaces/auth/login";
import { ApiResultGeneric } from "@/typings/interfaces/result/apiResult";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
// ❌ Xóa dòng import này
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Platform } from "react-native";

import { useAuthStore } from "@/store/authStore";
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Toast } from "toastify-react-native";

// ✅ Import storage wrapper
import AsyncStorage from "@/utils/webStorage";

type CallbackQueue = ((token: string | null) => void)[];

const isWeb = Platform.OS === "web";

class Http {
  private instance: AxiosInstance;
  private subscribers: CallbackQueue = [];
  private isRefreshing = false;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT-REQUEST": "HERO",
      },
    });

    this.instance.interceptors.request.use(this.handleBeforeRequest.bind(this));
    this.instance.interceptors.response.use(
      this.handleSuccess.bind(this),
      this.handleRequestError.bind(this),
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_NAME);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async handleBeforeRequest(request: InternalAxiosRequestConfig) {
    try {
      const token = await this.getToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error setting auth header:", error);
    }
    return request;
  }

  private handleSuccess(response: AxiosResponse) {
    return response;
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const is_remember = await AsyncStorage.getItem(AUTH_TOKEN_REMEMBER);
      if (!is_remember) return null;

      const response = await axios.post<ApiResultGeneric<LoggedIn>>(
        `${process.env.EXPO_PUBLIC_BASE_URL}${API.AUTH.REFRESH}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-CLIENT-REQUEST": "HERO",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;
      if (data.code === 200 && data.data) {
        const newToken = data.data.access_token;
        await AsyncStorage.setItem(AUTH_TOKEN_NAME, newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error("Refresh token error:", error);
      return null;
    }
  }

  private async handleRequestError(error: any) {
    // Network ERROR
    if (error.code === "ERR_NETWORK") {
      if (!isWeb) {
        Toast.error(
          "Lỗi mạng xin vui lòng thử lại",
          POSITION_TOAST.TOP,
          "close-outline",
        );
      } else {
        console.error("Network error:", error);
      }
      return Promise.reject(error);
    }

    // Nếu không có response (lỗi khác)
    if (!error.response) {
      return Promise.reject(error);
    }

    const { config, response } = error;
    const status = response?.status;
    const originalRequest = config;

    // Xử lý 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await this.refreshToken();

        if (newToken) {
          // Cập nhật token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.instance(originalRequest);
        } else {
          // Không thể refresh, logout
          await this.logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        await this.logout();
        return Promise.reject(refreshError);
      }
    }

    // Xử lý 403 Forbidden
    if (status === 403) {
      if (!isWeb) {
        await AsyncStorage.setItem("isToastNotPermission", "true");
        const currentPath = isWeb ? window.location.pathname : "";
        await AsyncStorage.setItem("PATH", currentPath);
        Toast.error(
          "Bạn không có quyền truy cập",
          POSITION_TOAST.TOP,
          "close-outline",
        );
      }
      await this.logout();
      return Promise.reject(error);
    }

    // Xử lý lỗi token
    const message = response?.data?.message;
    if (
      message === "Token could not be parsed from the request." ||
      message === "Token has expired" ||
      message === "Token is invalid"
    ) {
      await this.logout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }

  private async logout() {
    try {
      // Reset auth store state so auth stack does not auto-redirect back
      // into the app while the user is already being forced to login.
      useAuthStore.setState({
        token: null,
        isLoggedIn: false,
        user: null,
        user_type: 0,
        is_admin: false,
      });

      await AsyncStorage.removeItem(AUTH_TOKEN_NAME);
      await AsyncStorage.removeItem(AUTH_TOKEN_REMEMBER);
      router.replace("/(auth)/LoginScreen");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // GET request
  public async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get<T>(url, { params });
    return response.data;
  }

  // POST request
  public async post<T>(url: string, data: any): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    return response.data;
  }

  // POST request with file
  public async postWithFile<T>(url: string, data: any): Promise<T> {
    const formData = new FormData();

    // Convert data to FormData
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // POST a pre-built FormData (multipart). Use this for file/array uploads
  // where postWithFile's key/value flattening is insufficient (e.g. images[]).
  public async postForm<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // PUT request
  public async put<T>(url: string, data: any): Promise<T> {
    const response = await this.instance.put<T>(url, data);
    return response.data;
  }

  // DELETE request
  public async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url);
    return response.data;
  }

  // Export file
  public async ExportFile<T>(url: string): Promise<T> {
    const response = await this.instance.get(url, { responseType: "blob" });
    return response.data;
  }

  // Export PDF
  public async ExportFileToPDF<T>(url: string): Promise<T> {
    const response = await this.instance.get(url, { responseType: "blob" });
    return response.data;
  }

  // Export with data
  public async ExportFileWithData<T>(url: string, data: any[]): Promise<T> {
    const response = await this.instance.request({
      method: "POST",
      url: url,
      data: data,
      responseType: "blob",
    });
    return response.data;
  }
}

export default new Http(process.env.EXPO_PUBLIC_BASE_URL as string);
