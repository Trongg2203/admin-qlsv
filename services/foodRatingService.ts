// services/foodRatingService.ts

import BaseService from "./baseServices";


class FoodRatingService extends BaseService {
  async rateFood(foodId: string, rating: number, comment?: string) {
    const payload = {
      food_id: foodId,
      rating: rating,
      comment: comment || "",
    };
    return this.post("/api/food-ratings/rate", payload);
  }
}

export default new FoodRatingService();