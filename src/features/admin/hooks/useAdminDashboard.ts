import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getAdminDashboardData } from "@/features/admin/services/admin.service";

export function useAdminDashboard(enabled: boolean) {
  return useCustomQuery({
    key: queryKeys.admin.dashboard(),
    queryFn: getAdminDashboardData,
    options: {
      enabled,
    },
  });
}
