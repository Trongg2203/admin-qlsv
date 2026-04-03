import {
  API,
  AUTH_TOKEN_NAME,
  AUTH_TOKEN_REMEMBER,
} from "@/constants/constants";
import { LoggedIn } from "@/typings/interfaces/auth/login";
import {
  ApiResult,
  ApiResultGeneric,
} from "@/typings/interfaces/result/apiResult";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Toast } from "toastify-react-native";

type CallbackQueue = ((token: string | null) => void)[];

class Http {
  private instance: AxiosInstance;
  private subscribers: CallbackQueue = [];
  constructor(baseURL: string) {
    // locale = i18n.global.locale;
    this.instance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT-REQUEST": "HERO",
        Authorization: `Bearer ${AsyncStorage.getItem(AUTH_TOKEN_NAME)}`,
      },
    });
    this.instance.interceptors.request.use(this.handleBeforeRequest.bind(this));

    this.instance.interceptors.response.use(
      this.handleSuccess,
      this.handleRequestError.bind(this),
    );
  }

  private async handleBeforeRequest(request: InternalAxiosRequestConfig) {
    // const errorStore = useErrorStore();
    // errorStore.clear();
    //
    request.headers.Authorization = `Bearer ${await AsyncStorage.getItem(
      AUTH_TOKEN_NAME,
    )}`;

    //set default locale for each request
    // request.headers["X-CLIENT-LANGUAGE"] = i18n.global.locale.value;
    return request;
  }

  private handleSuccess(response: AxiosResponse) {
    return response;
  }

  private async handleRequestError(error: any) {
    //Network ERROR
    if (error.code === "ERR_NETWORK") {
      Toast.error(
        "Lỗi mạng xin vui lòng thử lại",
        POSITION_TOAST.TOP,
        "close-outline",
      );
      return;
    }
    const {
      config,
      response: { status },
    } = error;
    const originalRequest = config;

    if (status === 401 && window.location.href.indexOf("/login") == -1) {
      const is_remember = AsyncStorage.getItem(AUTH_TOKEN_REMEMBER);
      if (is_remember != null) {
        try {
          axios
            .get<ApiResultGeneric<LoggedIn>>(
              process.env.EXPO_BASE_URL + API.AUTH.REFRESH,
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-CLIENT-REQUEST": "HERO",
                  Authorization: `Bearer ${AsyncStorage.getItem(
                    AUTH_TOKEN_NAME,
                  )}`,
                },
              },
            )
            .then((response) => {
              const data = response.data;
              if (data.code == 200 && data.data != null) {
                const token = data.data?.access_token;
                AsyncStorage.setItem(AUTH_TOKEN_NAME, token);
                this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
                this.subscribers.forEach((callback) => callback(token));
              }
            })
            .catch((err) => {
              console.log(err);
              // RemoveToken();
              // RedirectLogin();
            });
        } catch (err) {
          this.subscribers.forEach((callback) => callback(null));
          window.location.href = "/login";
        } finally {
          this.subscribers = [];
        }
        // Trả về một hàm callback để gọi lại API đã bị lỗi 401 trước đó
        return new Promise((resolve, reject) => {
          this.subscribers.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest)); // Gọi lại API đã bị lỗi 401
            } else {
              reject(error);
            }
          });
        });
      } else {
        // toast.error(i18n.global.t("token_expired"), {
        //     autoClose: false,
        //     closeButton: true,
        //     closeOnClick: true,
        // });
        // RemoveToken();
        // RedirectLogin();
      }
    }

    //not permission
    if (status === 403) {
      AsyncStorage.setItem("isToastNotPermission", "true");
      const currentPath = window.location.pathname;
      AsyncStorage.setItem("PATH", currentPath);
      // Toast.error(i18n.global.t("permission_denied"), {
      //     autoClose: false,
      //     closeButton: true,
      //     closeOnClick: true,
      // });

      // useSettingStore().permission = false;
      // RemoveToken();
      // RedirectLoginAndResetParam();
      return;
    }
    const data = error.response?.data as ApiResult;
    // const errorStore = useErrorStore();
    // errorStore.setError(true, [data.message ?? "An error occured"]);
    return Promise.reject(error);
  }

  // GET request
  public async get<T>(url: string, params?: any): Promise<T> {
    this.instance.defaults.headers["Content-Type"] = "application/json";
    const response = await this.instance.get<T>(url, { params });
    return response.data;
  }

  // POST request
  public async post<T>(url: string, data: any): Promise<T> {
    this.instance.defaults.headers["Content-Type"] = "application/json";
    const response = await this.instance.post<T>(url, data);
    return response.data;
  }

  // POST request
  public async postWithFile<T>(url: string, data: any): Promise<T> {
    this.instance.defaults.headers["Content-Type"] = "multipart/form-data";
    const response = await this.instance.post<T>(url, data);
    this.instance.defaults.headers["Content-Type"] = "application/jsons";
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

  // GET request
  public async ExportFile<T>(url: string): Promise<T> {
    const response = await this.instance.get(url, { responseType: "blob" });
    return response.data;
  }

  public async ExportFileToPDF<T>(url: string): Promise<T> {
    const response = await this.instance.get(url, { responseType: "blob" });
    return response.data;
  }

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
