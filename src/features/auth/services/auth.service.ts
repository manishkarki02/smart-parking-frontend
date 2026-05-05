import createApi from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";

const authApi = createApi("/auth");

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await authApi.post<ApiResponse<AuthResponse>>(
    "/login",
    data
  );
  return response.data.data;
}

export async function registerUser(data: RegisterRequest): Promise<string> {
  const response = await authApi.post<ApiResponse<string>>(
    "/register",
    data
  );
  return response.data.data;
}
