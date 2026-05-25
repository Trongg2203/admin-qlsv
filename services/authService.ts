import http from "@/api/http";
import BaseService from "./baseServices";
import { API } from "@/constants/constants";
import {
  ApiResult,
  ApiResultGeneric,
} from "@/typings/interfaces/result/apiResult";
import { LoggedIn, RegisterRequest } from "@/typings/interfaces/auth/login";

class AuthService extends BaseService {
  /**
   * POST /auth/register — creates the user + body profile in one call.
   * Returns the raw envelope on success ({code,message,data}) or, on a 422,
   * Laravel's default validation body ({message, errors}). Use parseApiError
   * to read field errors from either shape.
   */
  async register(data: RegisterRequest) {
    try {
      const result = await http.post<ApiResultGeneric<{ id: string; email: string }>>(
        API.AUTH.REGISTER,
        data,
      );
      return result;
    } catch (error: any) {
      return (
        error?.response?.data || {
          code: 500,
          message: "Có lỗi xảy ra",
          data: null,
        }
      );
    }
  }

  async login(data: { email: string; password: string; remember: true }) {
    try {
      const result = await http.post<ApiResultGeneric<LoggedIn>>(
        API.AUTH.LOGIN,
        data,
      );

      return result; // thành công
    } catch (error: any) {
      console.log("error", error);

      return (
        error?.response?.data || {
          code: 500,
          message: "Có lỗi xảy ra",
          data: null,
        }
      );
    }
  }

  async logout() {
    let response = null;
    try {
      response = await http.get<ApiResult>(API.AUTH.LOGOUT);
    } catch (err) {
      console.log(err);
      response = {
        code: 500,
        message: "An error occured",
      };
    }
    return response;
  }
}

export default new AuthService();
