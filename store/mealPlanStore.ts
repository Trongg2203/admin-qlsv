import { API } from "@/constants/constants";
import mealPlanService from "@/services/mealPlanService";
import {
  Food,
  FoodCategory,
  MealPlan,
  MealPlanRequest,
  MealPlanResult,
} from "@/typings/interfaces/mealPlan/mealPlan";
import { create } from "zustand";

interface MealPlanState {
  categories: FoodCategory[];
  foods: Food[];
  foodsByCategory: Food[];
  activeMealPlan: MealPlan | null;
  loading: boolean;
  fetchCategories: () => Promise<void>;
  fetchFoods: () => Promise<void>;
  fetchFoodsByCategory: (categoryId: string) => Promise<void>;
  fetchActiveMealPlan: () => Promise<void>;
  generateMealPlan: (
    payload: MealPlanRequest,
  ) => Promise<MealPlanResult | null>;
}

export const useMealPlanStore = create<MealPlanState>((set) => ({
  categories: [],
  foods: [],
  foodsByCategory: [],
  activeMealPlan: null,
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = await mealPlanService.getSingleWithOutSlug<
        FoodCategory[]
      >(API.FOOD.CATEGORIES);
      const categories = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];
      set({ categories });
    } finally {
      set({ loading: false });
    }
  },

  fetchFoods: async () => {
    set({ loading: true });
    try {
      const response = await mealPlanService.getSingleWithOutSlug<Food[]>(
        API.FOOD.FOODS,
      );
      const foods = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];
      set({ foods });
    } finally {
      set({ loading: false });
    }
  },

  fetchFoodsByCategory: async (categoryId) => {
    set({ loading: true });
    try {
      const response = await mealPlanService.getSingle<Food[]>(
        API.FOOD.BY_CATEGORY,
        categoryId,
      );
      const foodsByCategory = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];
      set({ foodsByCategory });
    } finally {
      set({ loading: false });
    }
  },

  fetchActiveMealPlan: async () => {
    set({ loading: true });
    try {
      const response = await mealPlanService.getSingleWithOutSlug<MealPlan>(
        API.MEAL_PLAN.ACTIVE,
      );
      set({ activeMealPlan: response ?? null });
    } finally {
      set({ loading: false });
    }
  },

  generateMealPlan: async (payload) => {
    set({ loading: true });
    try {
      const response = await mealPlanService.create<
        MealPlanRequest,
        MealPlanResult
      >(API.MEAL_PLAN.GENERATE, payload);
      if (response) set({ activeMealPlan: response ?? null });
      return response ?? null;
    } finally {
      set({ loading: false });
    }
  },
}));
