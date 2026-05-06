import createApi from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { AuthResponse } from "../types/auth.types";
import type { LoginSchema, RegisterSchema } from "../validation/auth.schema";

const authApi = createApi("/auth");

export async function loginUser(data: LoginSchema): Promise<AuthResponse> {
  const response = await authApi.post<ApiResponse<AuthResponse>>(
    "/login",
    data,
  );
  return response.data.data;
}

export async function registerUser(data: RegisterSchema): Promise<string> {
  const response = await authApi.post<ApiResponse<string>>("/register", data); // TODO: Change this to AuthResponse when backend is fixed
  return response.data.data;
}
