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

    if (error?.message) {
      if (typeof error.message === "string") {
        errorMessage = error.message;
      } else if (typeof error.message === "object") {
        // Xử lý validation errors: { "user_id": ["Vui lòng nhập..."] }
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

    // Xử lý axios error
    if (error?.response?.data) {
      errorObj = {
        code: error.response.data.code || error.response.status,
        message: error.response.data.message || error.response.data,
      };
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
