import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getVendorDashboard } from "../services/vendor.service";

export function useVendorDashboard() {
  return useCustomQuery({
    key: queryKeys.vendor.dashboard(),
    queryFn: getVendorDashboard,
  });
}
