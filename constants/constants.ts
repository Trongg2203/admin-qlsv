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

export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "",
    REGISTER:"/api/auth/register",
  },
  USER: {
    DETAIL: "/api/user/detail",
    PROFILE: "/api/user/profile",
    FORGOT_PASSWORD: "/api/user/forgot-password",
  },
  USER_GOAL: {
    CREATE: "/api/user-goal/create",
    UPDATE: "/api/user-goal/update",
    GET_BY_SELF: "/api/user-goal/get-by-self",
  },
};
