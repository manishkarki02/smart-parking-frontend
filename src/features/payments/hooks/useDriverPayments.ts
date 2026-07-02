import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getDriverPayments } from "@/features/payments/services/payment.service";
import type { DriverPaymentQueryParams } from "@/features/payments/types/payment.types";

export function useDriverPayments(
  params: DriverPaymentQueryParams,
  enabled: boolean,
) {
  return useCustomQuery({
    key: queryKeys.payment.driverList(params),
    queryFn: () => getDriverPayments(params),
    options: {
      enabled,
    },
  });
}
