import foodService from "@/services/foodService";
import {
  Product,
  ProductCategory,
  ProductImage,
  ProductPayload,
} from "@/typings/interfaces/product/product";
import { usePaginationStore } from "@/store/paginationStore";
import { create } from "zustand";

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  loading: boolean;

  fetchProducts: (filters?: {
    meal_type?: number;
    category_id?: string;
    page?: number;
    itemsPerPage?: number;
    search?: string;
    sortBy?: string;
    sortDesc?: "asc" | "desc";
  }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (payload: ProductPayload) => Promise<Product | null>;
  updateProduct: (id: string, payload: ProductPayload) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  fetchImages: (foodId: string) => Promise<ProductImage[]>;
  uploadImages: (
    foodId: string,
    assets: { uri: string; name?: string; type?: string }[],
  ) => Promise<ProductImage[]>;
  deleteImage: (foodId: string, imageId: string) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  loading: false,

  fetchProducts: async (filters) => {
    set({ loading: true });
    try {
      if (filters?.page || filters?.itemsPerPage) {
        const result = await foodService.getFoodsPage(filters);
        set({ products: result.data });
      } else {
        const products = await foodService.getFoods(filters);
        set({ products });
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    const categories = await foodService.getCategories();
    set({ categories });
  },

  createProduct: async (payload) => {
    const created = await foodService.createFood(payload);
    if (created) {
      const { currentPage, pageSize, searchTerm, sortBy, sortOrder } =
        usePaginationStore.getState();
      await get().fetchProducts({
        page: currentPage,
        itemsPerPage: pageSize,
        search: searchTerm || undefined,
        sortBy: sortBy || undefined,
        sortDesc: sortOrder,
      });
    }
    return created;
  },

  updateProduct: async (id, payload) => {
    const ok = await foodService.updateFood(id, payload);
    if (ok) {
      const { currentPage, pageSize, searchTerm, sortBy, sortOrder } =
        usePaginationStore.getState();
      await get().fetchProducts({
        page: currentPage,
        itemsPerPage: pageSize,
        search: searchTerm || undefined,
        sortBy: sortBy || undefined,
        sortDesc: sortOrder,
      });
    }
    return ok;
  },

  deleteProduct: async (id) => {
    const ok = await foodService.deleteFood(id);
    if (ok) {
      const { currentPage, pageSize, searchTerm, sortBy, sortOrder } =
        usePaginationStore.getState();
      await get().fetchProducts({
        page: currentPage,
        itemsPerPage: pageSize,
        search: searchTerm || undefined,
        sortBy: sortBy || undefined,
        sortDesc: sortOrder,
      });
    }
    return ok;
  },

  fetchImages: (foodId) => foodService.getImages(foodId),
  uploadImages: (foodId, assets) => foodService.uploadImages(foodId, assets),
  deleteImage: (foodId, imageId) => foodService.deleteImage(foodId, imageId),
}));
