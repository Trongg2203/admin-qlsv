import http from "@/api/http";
import { useErrorStore } from "@/store/errorStore";
import { ApiResultGeneric } from "@/typings/interfaces/result/apiResult";

class BaseService {
  constructor(private handleError?: (message?: string) => void) {}
  async post<T>(_url: string, data: T) {
    let result = false;
    try {
      const response = await http.post<ApiResultGeneric<T>>(_url, data);
      if (response && response.code === 200 && response.data != null) {
        result = true;
        // Clear error khi thành công
        useErrorStore.getState().clearError();
      } else if (response && response.code !== 200) {
        // Set error khi có lỗi từ response
        useErrorStore.getState().setError(response?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.log(error);
      // Set error từ exception
      useErrorStore.getState().setErrorFromException(error);
      return false;
    }
    return result;
  }

  async update<T>(_url: string, data: T): Promise<boolean> {
    let result = false;

    try {
      const response = await http.post<ApiResultGeneric<T>>(_url, data);
      if (response && response.code === 200 && response.data != null) {
        result = true;
        useErrorStore.getState().clearError();
      } else {
        useErrorStore.getState().setError(response?.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.log(err);
      useErrorStore.getState().setErrorFromException(err);
    }
    return result;
  }

  async getSingle<T>(_url: string, id: string) {
    let result: T | null = null;

    try {
      const response = await http.get<ApiResultGeneric<T>>(
        `${_url}/${id ?? ""}`,
      );
      if (response && response.code === 200 && response.data != null) {
        result = response.data ?? {};
      }
    } catch (err) {
      console.log(err);
    }
    return result;
  }

  async getSingleWithOutSlug<T>(_url: string) {
    let result: T | null = null;

    try {
      const response = await http.get<ApiResultGeneric<T>>(`${_url}`);
      if (response && response.code === 200 && response.data != null) {
        result = response.data ?? {};
      }
    } catch (err) {
      console.log(err);
    }
    return result;
  }

  async getSingleAndQuery<T>(
    _url: string,
    queryOrId?: string | number | Record<string, string | number | null>,
  ): Promise<T | null> {
    let result: T | null = null;

    try {
      let finalUrl = _url;

      // Nếu truyền là object => build query string
      if (
        queryOrId &&
        typeof queryOrId === "object" &&
        !Array.isArray(queryOrId)
      ) {
        const query = new URLSearchParams(
          Object.entries(queryOrId)
            .filter(([, value]) => value !== null && value !== undefined)
            .reduce(
              (acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
              },
              {} as Record<string, string>,
            ),
        ).toString();

        if (query) {
          finalUrl += `?${query}`;
        }
      }

      // Nếu truyền là id kiểu string | number → nối vào path
      else if (queryOrId !== undefined && typeof queryOrId !== "object") {
        finalUrl += `/${queryOrId}`;
      }

      const response = await http.get<ApiResultGeneric<T>>(finalUrl);

      if (response && response.code === 200 && response.data != null) {
        result = response.data ?? {};
      }
    } catch (err) {
      console.log("Error in getSingle:", err);
    }

    return result;
  }
}

export default BaseService;
