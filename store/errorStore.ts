// store/errorStore.ts
import { create } from "zustand";

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorState {
  // State
  hasError: boolean;
  errorCode: number | null;
  errorMessage: string | null;
  errorDetails: ErrorDetail[];
  rawError: any;

  // Actions
  setError: (error: any) => void;
  clearError: () => void;
  setErrorFromResponse: (response: any) => void;
  setErrorFromException: (error: any) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  // Initial state
  hasError: false,
  errorCode: null,
  errorMessage: null,
  errorDetails: [],
  rawError: null,

  // Set error từ response hoặc exception
  setError: (error: any) => {
    if (error?.code === 200) {
      // Không phải lỗi
      set({
        hasError: false,
        errorCode: null,
        errorMessage: null,
        errorDetails: [],
        rawError: null,
      });
      return;
    }

    // Parse error message
    let errorMessage = "Có lỗi xảy ra";
    let errorDetails: ErrorDetail[] = [];
    let errorCode = error?.code || null;

    // Laravel default validation shape: { message, errors: { field: [...] } }
    // (used by RegisterRequest / UpdateProfileRequest).
    if (error?.errors && typeof error.errors === "object") {
      errorDetails = Object.keys(error.errors).map((field) => ({
        field,
        message: Array.isArray(error.errors[field])
          ? error.errors[field].join(", ")
          : error.errors[field],
      }));
      errorMessage =
        typeof error.message === "string" && error.message
          ? error.message
          : "Vui lòng kiểm tra lại thông tin";
    } else if (error?.message) {
      if (typeof error.message === "string") {
        errorMessage = error.message;
      } else if (typeof error.message === "object") {
        // BaseRequest shape: message IS the { field: [...] } map.
        errorDetails = Object.keys(error.message).map((field) => ({
          field,
          message: Array.isArray(error.message[field])
            ? error.message[field].join(", ")
            : error.message[field],
        }));
        errorMessage = "Vui lòng kiểm tra lại thông tin";
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    set({
      hasError: true,
      errorCode,
      errorMessage,
      errorDetails,
      rawError: error,
    });
  },

  // Set error từ API response
  setErrorFromResponse: (response: any) => {
    if (response && response.code !== 200) {
      useErrorStore.getState().setError(response);
    } else {
      useErrorStore.getState().clearError();
    }
  },

  // Set error từ exception catch
  setErrorFromException: (error: any) => {
    let errorObj = {
      code: 500,
      message: error?.message || "Lỗi kết nối server",
    };

    // Xử lý axios error — preserve Laravel's `errors` map so field-level
    // validation messages survive the exception path (422 rejects the promise).
    if (error?.response?.data) {
      const data = error.response.data;
      useErrorStore.getState().setError({
        code: data.code || error.response.status,
        message: data.message || data,
        errors: data.errors,
      });
      return;
    } else if (error?.request) {
      errorObj = {
        code: 0,
        message: "Không thể kết nối đến server",
      };
    }

    useErrorStore.getState().setError(errorObj);
  },

  // Clear error
  clearError: () => {
    set({
      hasError: false,
      errorCode: null,
      errorMessage: null,
      errorDetails: [],
      rawError: null,
    });
  },
}));
