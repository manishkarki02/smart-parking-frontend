import createApi from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { AdminStats, AdminUser, AdminBooking } from "../types/admin.types";
import { ADMIN_ROUTES, API_BASE } from "@/common/constants/api-routes";

const adminApi = createApi(API_BASE.ADMIN);

export async function getDashboard(): Promise<AdminStats> {
  const response = await adminApi.get<ApiResponse<AdminStats>>(
    ADMIN_ROUTES.DASHBOARD,
  );
  return response.data.data;
}

export async function getAllBookings(): Promise<AdminBooking[]> {
  const response = await adminApi.get<ApiResponse<AdminBooking[]>>(
    ADMIN_ROUTES.BOOKINGS,
  );
  return response.data.data ?? [];
}

export async function getVendors(): Promise<AdminUser[]> {
  const response = await adminApi.get<ApiResponse<AdminUser[]>>(
    ADMIN_ROUTES.VENDORS,
  );
  return response.data.data ?? [];
}

export async function getDrivers(): Promise<AdminUser[]> {
  const response = await adminApi.get<ApiResponse<AdminUser[]>>(
    ADMIN_ROUTES.DRIVERS,
  );
  return response.data.data ?? [];
}
