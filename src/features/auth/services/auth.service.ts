import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data
  );
  return response.data.data;
}

export async function registerUser(data: RegisterRequest): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    "/auth/register",
    data
  );
  return response.data.data;
}
