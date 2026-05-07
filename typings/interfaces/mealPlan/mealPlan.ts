export interface FoodCategory {
  id: string | number;
  name: string;
  description?: string | null;
}

export interface Food {
  id: string | number;
  name: string;
  category_id?: string | number | null;
  calories?: number | string | null;
  image_url?: string | null;
}

export interface MealPlanDetail {
  id: string | number;
  meal_plan_id: string | number;
  food_id: string | number;
  day_number: number;
  meal_type: number;
  servings: string | number;
  total_calories: string | number;
  total_protein: string | number;
  total_carbs: string | number;
  total_fat: string | number;
  food: Food;
}

export interface MealPlan {
  id: string | number;
  plan_name: string;
  start_date: string;
  end_date: string;
  target_calories_per_day: string | number;
  generation_method: number;
  status: number;
  details: MealPlanDetail[];
}

export type MealPlanResult = MealPlan;

export interface MealPlanRequest {
  allergens?: string[];
  disliked_foods?: Array<string | number>;
}
