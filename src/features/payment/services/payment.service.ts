import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type {
  PaymentRequest,
  PaymentResponse,
} from "../types/payment.types";

export async function initiatePayment(
  data: PaymentRequest
): Promise<PaymentResponse> {
  const response = await api.post<ApiResponse<PaymentResponse>>(
    "/payment/khalti/initiate",
    data
  );
  return response.data.data;
}
