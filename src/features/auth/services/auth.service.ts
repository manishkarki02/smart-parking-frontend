import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { AuthResponse } from "../types/auth.types";
import type { LoginSchema, RegisterSchema } from "../validations/auth.schema";
import { API_BASE, AUTH_ROUTES } from "@/config/api-routes";

const authApi = createApi(API_BASE.AUTH);

export async function loginUser(data: LoginSchema): Promise<AuthResponse> {
  const response = await authApi.post<ApiResponse<AuthResponse>>(
    AUTH_ROUTES.LOGIN,
    data,
  );
  return response.data.data;
}

export async function registerUser(data: RegisterSchema): Promise<string> {
  const response = await authApi.post<ApiResponse<string>>(
    AUTH_ROUTES.REGISTER,
    data,
  ); // TODO: Change this to AuthResponse when backend is fixed
  return response.data.data;
}
