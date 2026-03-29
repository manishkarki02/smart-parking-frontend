import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type {
  AdminStats,
  AdminUser,
  AdminBooking,
} from "../types/admin.types";

export async function getDashboard(): Promise<AdminStats> {
  const response = await api.get<ApiResponse<AdminStats>>("/admin/dashboard");
  return response.data.data;
}

export async function getAllBookings(): Promise<AdminBooking[]> {
  const response = await api.get<ApiResponse<AdminBooking[]>>("/admin/bookings");
  return response.data.data ?? [];
}

export async function getVendors(): Promise<AdminUser[]> {
  const response = await api.get<ApiResponse<AdminUser[]>>("/admin/vendors");
  return response.data.data ?? [];
}

export async function getDrivers(): Promise<AdminUser[]> {
  const response = await api.get<ApiResponse<AdminUser[]>>("/admin/drivers");
  return response.data.data ?? [];
}
