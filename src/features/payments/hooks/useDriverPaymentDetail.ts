import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getDriverPaymentDetail } from "@/features/payments/services/payment.service";

export function useDriverPaymentDetail(paymentId: string | null) {
  return useCustomQuery({
    key: queryKeys.payment.driverDetail(paymentId),
    queryFn: () => getDriverPaymentDetail(paymentId ?? ""),
    options: {
      enabled: Boolean(paymentId),
    },
  });
}
