// Admin "product" = a food item (server: foods table).

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  sort_order?: number;
}

export interface ProductImage {
  id: string;
  food_id: string;
  directory: string;
  file_name: string;
  file_ext: string;
  is_primary: number;
  sort_order: number;
  // Public-relative URLs appended by the backend (ProductImageModel accessors).
  url?: string;
  thumb_url?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  serving_size: number | string;
  serving_unit: string;
  calories: number | string;
  protein: number | string;
  carbs: number | string;
  fat: number | string;
  meal_type: number;
  popularity_score?: number;
  image_url?: string | null; // primary image, appended by FoodModel
  category?: { id: string; name: string } | null;
}

// Mirrors App\Http\Requests\Food\StoreFoodRequest.
export interface ProductPayload {
  category_id: string;
  name: string;
  serving_size: number;
  serving_unit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type?: number;
}
