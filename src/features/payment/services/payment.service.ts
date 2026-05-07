import type { ApiResponse } from "@/common/types/api.types";
import type { PaymentRequest, PaymentResponse } from "../types/payment.types";
import { API_BASE, PAYMENT_ROUTES } from "@/common/constants/api-routes";
import createApi from "@/lib/api";

const paymentApi = createApi(API_BASE.PAYMENT);

export async function initiatePayment(
  data: PaymentRequest,
): Promise<PaymentResponse> {
  const response = await paymentApi.post<ApiResponse<PaymentResponse>>(
    PAYMENT_ROUTES.KHALTI_INITIATE,
    data,
  );
  return response.data.data;
}
