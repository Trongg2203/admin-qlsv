export const AUTH_TOKEN_NAME = "AUTH_TOKEN_NAME";
export const AUTH_TOKEN_REMEMBER = "AUTH_TOKEN_REMEMBER";

export const STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

export const STATUS_COMPLETED = {
  INCOMPLETE: 0,
  COMPLETED: 1,
};

export const GOALSTATUS = {
  ACTIVE: 0,
  PAUSED: 1,
  COMPLETED: 2,
  ANBANDONED: 3,
};

// NOTE: paths below are verified 1:1 against server-qlsv/routes/api.php.
// Do not add routes the backend does not expose (e.g. forgot-password,
// admin user create/update/delete) — the backend only creates users via
// POST /auth/register.
export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
  },
  USER: {
    BASE: "/api/user",
    DETAIL: "/api/user/detail",
    PROFILE: "/api/user/profile",
    LIST: "/api/user/get-list",
  },
  GOAL: {
    BASE: "/api/goals",
    ACTIVE: "/api/goals/active",
  },
  CALORIE: {
    CALCULATE: "/api/calorie/calculate",
    LATEST: "/api/calorie/latest",
    HISTORY: "/api/calorie/history",
  },
  FOOD: {
    CATEGORIES: "/api/food-categories",
    FOODS: "/api/foods",
    BY_CATEGORY: "/api/foods/category",
  },
  FOOD_RATING: {
    RATE: "/api/food-ratings/rate",
    MY: "/api/food-ratings/my",
    BY_FOOD: "/api/food-ratings/food",
  },
  MEAL_PLAN: {
    BASE: "/api/meal-plans",
    GENERATE: "/api/meal-plans/generate",
    ACTIVE: "/api/meal-plans/active",
  },
};
