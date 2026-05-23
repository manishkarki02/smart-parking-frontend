import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import { ADMIN_ROUTES, API_BASE } from "@/config/api-routes";
import type { User } from "../types/user.types";

const adminApi = createApi(API_BASE.ADMIN);

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
