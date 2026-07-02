import { keepPreviousData } from "@tanstack/react-query";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getAdminPayments } from "@/features/payments/services/payment.service";
import type { AdminPaymentsQueryParams } from "@/features/payments/types/payment.types";

export function useAdminPayments(
  params: AdminPaymentsQueryParams,
  enabled: boolean,
) {
  return useCustomQuery({
    key: queryKeys.payment.adminList(params),
    queryFn: () => getAdminPayments(params),
    options: {
      enabled,
      placeholderData: keepPreviousData,
    },
  });
}
