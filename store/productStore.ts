import foodService from "@/services/foodService";
import {
  Product,
  ProductCategory,
  ProductImage,
  ProductPayload,
} from "@/typings/interfaces/product/product";
import { create } from "zustand";

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  loading: boolean;

  fetchProducts: (filters?: {
    meal_type?: number;
    category_id?: string;
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
      const products = await foodService.getFoods(filters);
      set({ products });
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
    if (created) await get().fetchProducts();
    return created;
  },

  updateProduct: async (id, payload) => {
    const ok = await foodService.updateFood(id, payload);
    if (ok) await get().fetchProducts();
    return ok;
  },

  deleteProduct: async (id) => {
    const ok = await foodService.deleteFood(id);
    if (ok) await get().fetchProducts();
    return ok;
  },

  fetchImages: (foodId) => foodService.getImages(foodId),
  uploadImages: (foodId, assets) => foodService.uploadImages(foodId, assets),
  deleteImage: (foodId, imageId) => foodService.deleteImage(foodId, imageId),
}));
