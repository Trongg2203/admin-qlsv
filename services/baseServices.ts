// api/baseService.ts
import http from "@/api/http";
import { useErrorStore } from "@/store/errorStore";
import { usePaginationStore } from "@/store/paginationStore";
import { IPagination, PaginatedResult } from "@/typings/interfaces/paging";
import {
  ApiResult,
  ApiResultGeneric,
} from "@/typings/interfaces/result/apiResult";
import { lastSeparator } from "@/utils/urlHelpers";
import ToastManager from "toastify-react-native/components/ToastManager";

class BaseService {
  constructor(private handleError?: (message?: string) => void) {}

  private resolveRequestedPerPage(
    query?: Record<string, string | number | null>,
  ): number | null {
    if (!query) return null;

    const rawPerPage = query.per_page ?? query.perPage;
    if (rawPerPage === null || rawPerPage === undefined) return null;

    const parsedPerPage =
      typeof rawPerPage === "number" ? rawPerPage : Number(rawPerPage);

    if (!Number.isFinite(parsedPerPage) || parsedPerPage <= 0) return null;
    return parsedPerPage;
  }

  async post<T>(_url: string, data: T) {
    let result = false;
    try {
      const response = await http.post<ApiResultGeneric<T>>(_url, data);
      if (
        response &&
        (response.code === 200 || response.code === 201) &&
        response.data != null
      ) {
        result = true;
        useErrorStore.getState().clearError();
      } else if (response) {
        useErrorStore.getState().setErrorFromResponse(response);
      }
    } catch (error) {
      console.log(error);
      useErrorStore.getState().setErrorFromException(error);
      return false;
    }
    return result;
  }

  async create<TRequest, TResponse = TRequest>(
    _url: string,
    data: TRequest,
  ): Promise<TResponse | null> {
    let result: TResponse | null = null;

    try {
      const response = await http.post<ApiResultGeneric<TResponse>>(_url, data);
      if (
        response &&
        (response.code === 200 || response.code === 201) &&
        response.data != null
      ) {
        result = response.data;
        useErrorStore.getState().clearError();
      } else {
        useErrorStore.getState().setErrorFromResponse(response);
      }
    } catch (error) {
      console.log(error);
      useErrorStore.getState().setErrorFromException(error);
      return null;
    }

    return result;
  }

  async update<T>(_url: string, data: T): Promise<boolean> {
    let result = false;

    try {
      const response = await http.put<ApiResultGeneric<T>>(_url, data);
      const isOk = response && (response.code === 200 || response.code === 204);

      if (isOk) {
        result = true;
        useErrorStore.getState().clearError();
      } else {
        useErrorStore.getState().setErrorFromResponse(response);
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
      } else if (queryOrId !== undefined && typeof queryOrId !== "object") {
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

  // Cập nhật method getList để tự động cập nhật store
  async getList<T>(
    _url: string,
    query?: Record<string, string | number | null>,
    autoUpdateStore: boolean = true, // Tham số để tự động cập nhật store
  ): Promise<T[]> {
    let result: T[] = [];

    try {
      let finalUrl = _url;

      // Lấy params từ store nếu không có query
      if (!query) {
        const { currentPage, pageSize, searchTerm, sortBy, sortOrder } =
          usePaginationStore.getState();
        query = {
          page: currentPage,
          per_page: pageSize,
        };

        if (searchTerm) {
          query.search = searchTerm;
        }

        if (sortBy) {
          query.sort_by = sortBy;
          query.sort_order = sortOrder;
        }
      }

      if (query) {
        const queryString = new URLSearchParams(
          Object.entries(query)
            .filter(([, value]) => value !== null && value !== undefined)
            .reduce(
              (acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
              },
              {} as Record<string, string>,
            ),
        ).toString();

        if (queryString) {
          finalUrl += `?${queryString}`;
        }
      }

      const response =
        await http.get<ApiResultGeneric<IPagination<T>>>(finalUrl);

      if (response && response.code === 200 && response.data != null) {
        result = response.data.data ?? [];
        const requestedPerPage = this.resolveRequestedPerPage(query);

        // Tự động cập nhật store pagination
        if (autoUpdateStore) {
          usePaginationStore.getState().setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            perPage: requestedPerPage ?? response.data.per_page,
            total: response.data.total,
          });
        }

        useErrorStore.getState().clearError();
      } else {
        useErrorStore.getState().setError(response?.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.log("Error in getList:", err);
      useErrorStore.getState().setErrorFromException(err);
    }

    return result;
  }

  // Method getListWithPagination cũng cập nhật store
  async getListWithPagination<T>(
    _url: string,
    query?: Record<string, string | number | null>,
    autoUpdateStore: boolean = true,
  ): Promise<PaginatedResult<T>> {
    const defaultResult: PaginatedResult<T> = {
      data: [],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
        from: 0,
        to: 0,
        nextPageUrl: null,
        prevPageUrl: null,
      },
    };

    try {
      let finalUrl = _url;

      if (query) {
        const queryString = new URLSearchParams(
          Object.entries(query)
            .filter(([, value]) => value !== null && value !== undefined)
            .reduce(
              (acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
              },
              {} as Record<string, string>,
            ),
        ).toString();

        if (queryString) {
          finalUrl += `?${queryString}`;
        }
      }

      const response =
        await http.get<ApiResultGeneric<IPagination<T>>>(finalUrl);

      if (response && response.code === 200 && response.data != null) {
        const paginationData = response.data;
        const requestedPerPage = this.resolveRequestedPerPage(query);
        const result = {
          data: paginationData.data ?? [],
          pagination: {
            currentPage: paginationData.current_page,
            lastPage: paginationData.last_page,
            perPage: requestedPerPage ?? paginationData.per_page,
            total: paginationData.total,
            from: paginationData.from,
            to: paginationData.to,
            nextPageUrl: paginationData.next_page_url,
            prevPageUrl: paginationData.prev_page_url,
          },
        };

        // Tự động cập nhật store pagination
        if (autoUpdateStore) {
          usePaginationStore.getState().setPagination({
            currentPage: paginationData.current_page,
            lastPage: paginationData.last_page,
            perPage: requestedPerPage ?? paginationData.per_page,
            total: paginationData.total,
          });
        }

        useErrorStore.getState().clearError();
        return result;
      } else {
        useErrorStore.getState().setError(response?.message || "Có lỗi xảy ra");
        return defaultResult;
      }
    } catch (err) {
      console.log("Error in getListWithPagination:", err);
      useErrorStore.getState().setErrorFromException(err);
      return defaultResult;
    }
  }

  async delete(
    _url: string,
    id: Array<string> | Array<number>,
  ): Promise<boolean> {
    try {
      const response = await http.delete<ApiResult>(
        `${lastSeparator(_url)}${id.map((x) => x).join(",") ?? ""}`,
      );
      if (response && response.code === 200) {
        // toast.success(response.message ?? "");
        ToastManager.show({
          type: "success",
          text1: response.message ?? "Xóa thành công",
        });
        return true;
      } else
        ToastManager.show({
          type: "error",
          text1: response.message ?? "Có lỗi xảy ra",
        });
    } catch (err: any) {
      ToastManager.show({
        type: "error",
        text1: err.response.data.message,
      });
      console.log(err);
    }
    return false;
  }
}

export default BaseService;
