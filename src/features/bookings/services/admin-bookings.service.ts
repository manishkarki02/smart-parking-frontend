import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import { ADMIN_ROUTES, API_BASE } from "@/config/api-routes";
import type { AdminBooking } from "../types/admin-booking.types";

const adminApi = createApi(API_BASE.ADMIN);

export async function getAllBookings(): Promise<AdminBooking[]> {
  const response = await adminApi.get<ApiResponse<AdminBooking[]>>(
    ADMIN_ROUTES.BOOKINGS,
  );
  return response.data.data ?? [];
}
