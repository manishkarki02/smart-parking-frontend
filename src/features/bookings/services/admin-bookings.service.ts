import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { PaginatedResult } from "@/common/types/pagination.types";
import { normalizePaginatedResponse } from "@/common/utils/api-response";
import { ADMIN_ROUTES, API_BASE } from "@/config/api-routes";
import type { AdminBooking } from "../types/admin-booking.types";
import type { AdminListParams } from "@/features/admin/services/admin.service";

const adminApi = createApi(API_BASE.ADMIN);

export async function getAllBookings(): Promise<AdminBooking[]> {
  const response = await adminApi.get<ApiResponse<AdminBooking[]>>(
    ADMIN_ROUTES.BOOKINGS,
  );
  return response.data.data ?? [];
}

export async function getAdminBookings(
  params: AdminListParams = {},
): Promise<PaginatedResult<AdminBooking>> {
  const response = await adminApi.get<ApiResponse<unknown>>(
    ADMIN_ROUTES.BOOKINGS,
    {
      params: {
        search: params.search || undefined,
        page: params.page,
      },
    },
  );
  return normalizePaginatedResponse<AdminBooking>(response.data.data);
}
