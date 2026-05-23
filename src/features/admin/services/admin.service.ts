import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { AdminStats } from "../types/admin.types";
import { ADMIN_ROUTES, API_BASE } from "@/config/api-routes";

const adminApi = createApi(API_BASE.ADMIN);

export async function getDashboard(): Promise<AdminStats> {
  const response = await adminApi.get<ApiResponse<AdminStats>>(
    ADMIN_ROUTES.DASHBOARD,
  );
  return response.data.data;
}
