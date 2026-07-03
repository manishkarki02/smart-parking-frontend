import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getAdminPaymentSummary } from "@/features/payments/services/payment.service";
import type { AdminPaymentSummaryParams } from "@/features/payments/types/payment.types";

export function useAdminPaymentSummary(
  params: AdminPaymentSummaryParams,
  enabled = true,
) {
  return useCustomQuery({
    key: queryKeys.payment.adminSummary(params),
    queryFn: () => getAdminPaymentSummary(params),
    options: {
      enabled,
    },
  });
}
