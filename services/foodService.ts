import http from "@/api/http";
import { API } from "@/constants/constants";
import {
  ApiResult,
  ApiResultGeneric,
} from "@/typings/interfaces/result/apiResult";
import { PaginatedResult } from "@/typings/interfaces/paging";
import {
  Product,
  ProductCategory,
  ProductImage,
  ProductPayload,
} from "@/typings/interfaces/product/product";
import BaseService from "./baseServices";

// Backend list endpoints wrap rows as { total, data: [...] } inside the
// envelope's `data`, so the array lives at body.data.data.
type ListEnvelope<T> = ApiResultGeneric<{ total: number; data: T[] }>;

function unwrapList<T>(body: ListEnvelope<T> | undefined): T[] {
  const inner = body?.data?.data;
  return Array.isArray(inner) ? inner : [];
}

class FoodService extends BaseService {
  // ── Foods (admin "products") ──────────────────────────────────────────────
  async getFoods(filters?: {
    meal_type?: number;
    category_id?: string;
    page?: number;
    itemsPerPage?: number;
    search?: string;
    sortBy?: string;
    sortDesc?: "asc" | "desc";
  }): Promise<Product[]> {
    const body = await http.get<ListEnvelope<Product>>(API.FOOD.FOODS, filters);
    return unwrapList<Product>(body);
  }

  async getFoodsPage(filters?: {
    meal_type?: number;
    category_id?: string;
    page?: number;
    itemsPerPage?: number;
    search?: string;
    sortBy?: string;
    sortDesc?: "asc" | "desc";
  }): Promise<PaginatedResult<Product>> {
    return this.getListWithPagination<Product>(API.FOOD.FOODS, filters);
  }

  async getCategories(): Promise<ProductCategory[]> {
    const body = await http.get<ListEnvelope<ProductCategory>>(
      API.FOOD.CATEGORIES,
    );
    return unwrapList<ProductCategory>(body);
  }

  async createFood(payload: ProductPayload): Promise<Product | null> {
    const body = await http.post<ApiResultGeneric<Product>>(
      API.FOOD.FOODS,
      payload,
    );
    return body?.code === 200 || body?.code === 201 ? (body.data ?? null) : null;
  }

  async updateFood(id: string, payload: ProductPayload): Promise<boolean> {
    const body = await http.put<ApiResult>(`${API.FOOD.FOODS}/${id}`, payload);
    return body?.code === 200 || body?.code === 201;
  }

  async deleteFood(id: string): Promise<boolean> {
    const body = await http.delete<ApiResult>(`${API.FOOD.FOODS}/${id}`);
    return body?.code === 200;
  }

  // ── Food images (separate upload API) ──────────────────────────────────────
  async getImages(foodId: string): Promise<ProductImage[]> {
    const body = await http.get<ListEnvelope<ProductImage>>(
      `${API.FOOD.FOODS}/${foodId}/images`,
    );
    return unwrapList<ProductImage>(body);
  }

  /**
   * Upload one or more images for a food. Each `assets` entry is a picked file
   * descriptor { uri, name, type }. Sends multipart field `images[]` to match
   * FoodController::uploadImages validation.
   */
  async uploadImages(
    foodId: string,
    assets: { uri: string; name?: string; type?: string }[],
  ): Promise<ProductImage[]> {
    const form = new FormData();
    assets.forEach((asset, i) => {
      const name = asset.name ?? `image_${Date.now()}_${i}.jpg`;
      const type = asset.type ?? "image/jpeg";
      // RN FormData file shape; on web a Blob/File is appended instead.
      form.append("images[]", {
        uri: asset.uri,
        name,
        type,
      } as any);
    });

    const body = await http.postForm<ApiResultGeneric<ProductImage[]>>(
      `${API.FOOD.FOODS}/${foodId}/images`,
      form,
    );
    return Array.isArray(body?.data) ? body!.data! : [];
  }

  async deleteImage(foodId: string, imageId: string): Promise<boolean> {
    const body = await http.delete<ApiResult>(
      `${API.FOOD.FOODS}/${foodId}/images/${imageId}`,
    );
    return body?.code === 200;
  }
}

export default new FoodService();
