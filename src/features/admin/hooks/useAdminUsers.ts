import { useQueryClient } from "@tanstack/react-query";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import {
  approveVendor,
  banUser,
  deleteUser,
  deleteVendor,
  getAdminUsers,
  unbanUser,
} from "@/features/admin/services/admin.service";
import type {
  AdminUser,
  AdminUserRoleFilter,
} from "@/features/admin/types/admin-user.types";
import { mapAdminRawUsers } from "@/features/admin/utils/admin-user.utils";

export function useAdminUsers(role: AdminUserRoleFilter, enabled = true) {
  return useCustomQuery({
    key: queryKeys.admin.usersList(role),
    queryFn: async () => mapAdminRawUsers(await getAdminUsers(role)),
    options: {
      enabled,
    },
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: approveVendor,
    success: "Vendor approved successfully",
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersRoot() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboardRoot() });
    },
  });
}

export function useBanAdminUser() {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: banUser,
    success: "Driver banned successfully",
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersRoot() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboardRoot() });
    },
  });
}

export function useUnbanAdminUser() {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: unbanUser,
    success: "Driver unbanned successfully",
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersRoot() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboardRoot() });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: (user: AdminUser) =>
      user.role === "VENDOR" ? deleteVendor(user.id) : deleteUser(user.id),
    success: "User deleted successfully",
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersRoot() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboardRoot() });
    },
  });
}
