import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import { ADMIN_ROUTES, API_BASE, USER_ROUTES } from "@/config/api-routes";
import type { User } from "../types/user.types";

const adminApi = createApi(API_BASE.ADMIN);
const userApi = createApi(API_BASE.USERS);

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "DRIVER" | "VENDOR" | "ADMIN" | string;
  banned: boolean;
  approved: boolean;
}

export interface UserProfileUpdateRequest {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await userApi.get<ApiResponse<UserProfile>>(USER_ROUTES.ME);
  return response.data.data;
}

export async function updateMyProfile(
  data: UserProfileUpdateRequest,
): Promise<UserProfile> {
  const response = await userApi.put<ApiResponse<UserProfile>>(
    USER_ROUTES.ME,
    data,
  );
  return response.data.data;
}

export async function getVendors(): Promise<User[]> {
  const response = await adminApi.get<ApiResponse<User[]>>(ADMIN_ROUTES.USERS, {
    params: {
      role: "VENDOR",
    },
  });
  return response.data.data ?? [];
}

export async function getDrivers(): Promise<User[]> {
  const response = await adminApi.get<ApiResponse<User[]>>(ADMIN_ROUTES.USERS, {
    params: {
      role: "DRIVER",
    },
  });
  return response.data.data ?? [];
}
