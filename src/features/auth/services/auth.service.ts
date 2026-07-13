import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { AuthResponse } from "../types/auth.types";
import type { LoginSchema, RegisterSchema } from "../validations/auth.schema";
import { API_BASE, AUTH_ROUTES } from "@/config/api-routes";

const authApi = createApi(API_BASE.AUTH);
type RegisterPayload = Omit<RegisterSchema, "confirmPassword">;

export async function loginUser(data: LoginSchema): Promise<AuthResponse> {
  const response = await authApi.post<ApiResponse<AuthResponse>>(
    AUTH_ROUTES.LOGIN,
    data,
  );
  return response.data.data;
}

export async function registerUser(
  data: RegisterPayload,
): Promise<AuthResponse> {
  const response = await authApi.post<ApiResponse<AuthResponse>>(
    AUTH_ROUTES.REGISTER,
    data,
  );
  return response.data.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const response = await authApi.post<ApiResponse<AuthResponse>>(
    AUTH_ROUTES.REFRESH,
  );
  return response.data.data;
}

export async function logoutUser(): Promise<void> {
  await authApi.post<ApiResponse<void>>(AUTH_ROUTES.LOGOUT);
}

export async function logoutAllSessions(): Promise<void> {
  await authApi.post<ApiResponse<void>>(AUTH_ROUTES.LOGOUT_ALL);
}
