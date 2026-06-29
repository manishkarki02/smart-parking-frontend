import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import { ADMIN_ROUTES, API_BASE } from "@/config/api-routes";
import type { AdminBooking } from "../types/admin-booking.types";
import type {
  AdminListParams,
  PaginatedResult,
} from "@/features/admin/services/admin.service";

const adminApi = createApi(API_BASE.ADMIN);

type PaginatedBookingPayload = {
  items?: AdminBooking[];
  content?: AdminBooking[];
  data?: AdminBooking[];
  totalPages?: number;
  totalPage?: number;
  meta?: {
    totalPages?: number;
  };
};

function normalizeBookings(
  payload: AdminBooking[] | PaginatedBookingPayload,
): PaginatedResult<AdminBooking> {
  if (Array.isArray(payload)) {
    return { data: payload, totalPages: 1 };
  }

  return {
    data: payload.items ?? payload.content ?? payload.data ?? [],
    totalPages:
      payload.totalPages ?? payload.totalPage ?? payload.meta?.totalPages ?? 1,
  };
}

export async function getAllBookings(): Promise<AdminBooking[]> {
  const response = await adminApi.get<ApiResponse<AdminBooking[]>>(
    ADMIN_ROUTES.BOOKINGS,
  );
  return response.data.data ?? [];
}

export async function getAdminBookings(
  params: AdminListParams = {},
): Promise<PaginatedResult<AdminBooking>> {
  const response = await adminApi.get<
    ApiResponse<AdminBooking[] | PaginatedBookingPayload>
  >(ADMIN_ROUTES.BOOKINGS, {
    params: {
      search: params.search || undefined,
      page: params.page,
    },
  });
  return normalizeBookings(response.data.data ?? []);
}
