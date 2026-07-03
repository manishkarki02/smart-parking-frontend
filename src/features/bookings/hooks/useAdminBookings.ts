import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getAdminBookings } from "@/features/bookings/services/admin-bookings.service";

export function useAdminBookings(enabled = true) {
  return useCustomQuery({
    key: queryKeys.admin.bookings(),
    queryFn: () => getAdminBookings(),
    options: {
      enabled,
    },
  });
}
