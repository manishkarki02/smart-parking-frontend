import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getAdminPaymentDetail } from "@/features/payments/services/payment.service";

export function useAdminPaymentDetail(paymentId: string | null) {
  return useCustomQuery({
    key: queryKeys.payment.adminDetail(paymentId),
    queryFn: () => getAdminPaymentDetail(paymentId ?? ""),
    options: {
      enabled: Boolean(paymentId),
    },
  });
}
