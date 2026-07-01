import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import type {
  AdminDashboardResponse,
  AdminStats,
  AdminUser,
} from "../types/admin.types";
import type {
  AdminRawUser,
  AdminUserRole,
  AdminUserRoleFilter,
} from "@/features/admin/types/admin-user.types";
import { ADMIN_ROUTES, API_BASE } from "@/config/api-routes";
import { getAdminBookings } from "@/features/bookings/services/admin-bookings.service";
import { buildAdminDashboardData } from "@/features/admin/utils/admin-dashboard.utils";
import { mergeAdminUsers } from "@/features/admin/utils/admin-user.utils";

export type { AdminUser } from "../types/admin.types";

const adminApi = createApi(API_BASE.ADMIN);

export interface AdminListParams {
  search?: string;
  page?: number;
}

export interface PaginatedResult<TData> {
  data: TData[];
  totalPages: number;
}

type PaginatedPayload<TData> = {
  items?: TData[];
  content?: TData[];
  data?: TData[];
  totalPages?: number;
  totalPage?: number;
  meta?: {
    totalPages?: number;
  };
};

function normalizePaginatedResult<TData>(
  payload: TData[] | PaginatedPayload<TData>,
): PaginatedResult<TData> {
  if (Array.isArray(payload)) {
    return { data: payload, totalPages: 1 };
  }

  return {
    data: payload.items ?? payload.content ?? payload.data ?? [],
    totalPages:
      payload.totalPages ?? payload.totalPage ?? payload.meta?.totalPages ?? 1,
  };
}

export async function getDashboard(): Promise<AdminStats> {
  const response = await adminApi.get<ApiResponse<AdminStats>>(
    ADMIN_ROUTES.DASHBOARD,
  );
  return response.data.data;
}

export async function getAdminDashboardData(): Promise<AdminDashboardResponse> {
  const [stats, bookings, vendors, drivers] = await Promise.all([
    getDashboard(),
    getAdminBookings(),
    getAdminVendors(),
    getAdminDrivers(),
  ]);

  return buildAdminDashboardData({
    stats,
    bookings: bookings.data,
    vendors: vendors.data,
    drivers: drivers.data,
  });
}

export async function getAdminVendors(
  params: AdminListParams = {},
): Promise<PaginatedResult<AdminUser>> {
  const response = await adminApi.get<
    ApiResponse<AdminUser[] | PaginatedPayload<AdminUser>>
  >(ADMIN_ROUTES.USERS, {
    params: {
      role: "VENDOR",
      search: params.search || undefined,
      page: params.page,
    },
  });
  return normalizePaginatedResult(response.data.data ?? []);
}

export async function getAdminDrivers(
  params: AdminListParams = {},
): Promise<PaginatedResult<AdminUser>> {
  const response = await adminApi.get<
    ApiResponse<AdminUser[] | PaginatedPayload<AdminUser>>
  >(ADMIN_ROUTES.USERS, {
    params: {
      role: "DRIVER",
      search: params.search || undefined,
      page: params.page,
    },
  });
  return normalizePaginatedResult(response.data.data ?? []);
}

export async function getAdminUsers(
  role: AdminUserRoleFilter,
): Promise<AdminRawUser[]> {
  if (role === "ALL") {
    const [vendors, drivers] = await Promise.all([
      getAdminUsersByRole("VENDOR"),
      getAdminUsersByRole("DRIVER"),
    ]);

    return mergeAdminUsers(vendors, drivers);
  }

  return getAdminUsersByRole(role);
}

export async function getAdminUsersByRole(
  role: AdminUserRole,
): Promise<AdminRawUser[]> {
  const response = await adminApi.get<ApiResponse<AdminRawUser[]>>(
    ADMIN_ROUTES.USERS,
    {
      params: {
        role,
      },
    },
  );

  return response.data.data ?? [];
}

export async function approveVendor(id: number | string): Promise<void> {
  await adminApi.put<ApiResponse<void>>(ADMIN_ROUTES.VENDOR_APPROVE(id));
}

export async function deleteVendor(id: number | string): Promise<void> {
  await adminApi.delete<ApiResponse<void>>(ADMIN_ROUTES.VENDOR_BY_ID(id));
}

export async function banUser(id: number | string): Promise<void> {
  await adminApi.put<ApiResponse<void>>(ADMIN_ROUTES.USER_BAN(id));
}

export async function unbanUser(id: number | string): Promise<void> {
  await adminApi.put<ApiResponse<void>>(ADMIN_ROUTES.USER_UNBAN(id));
}

export async function deleteUser(id: number | string): Promise<void> {
  await adminApi.delete<ApiResponse<void>>(ADMIN_ROUTES.USER_BY_ID(id));
}
