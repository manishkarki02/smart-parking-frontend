import type { ApiResponse } from "@/common/types/api.types";
import type {
  AdminPaymentDetail,
  AdminPaymentsPageResponse,
  AdminPaymentsQueryParams,
  AdminPaymentSummaryParams,
  AdminPaymentSummaryResponse,
  DriverPaymentHistoryItem,
  DriverPaymentPageResponse,
  DriverPaymentQueryParams,
  PaymentRequest,
  PaymentResponse,
} from "../types/payment.types";
import { ADMIN_ROUTES, API_BASE, PAYMENT_ROUTES } from "@/config/api-routes";
import createApi from "@/common/utils/api";

const paymentApi = createApi(API_BASE.PAYMENT);
const adminApi = createApi(API_BASE.ADMIN);

export async function initiatePayment(
  data: PaymentRequest,
): Promise<PaymentResponse> {
  const response = await paymentApi.post<ApiResponse<PaymentResponse>>(
    PAYMENT_ROUTES.KHALTI_INITIATE,
    data,
  );
  return response.data.data;
}

export async function getAdminPaymentSummary(
  params: AdminPaymentSummaryParams,
): Promise<AdminPaymentSummaryResponse> {
  const response = await adminApi.get<ApiResponse<AdminPaymentSummaryResponse>>(
    ADMIN_ROUTES.PAYMENT_SUMMARY,
    { params },
  );

  return response.data.data;
}

export async function getAdminPayments(
  params: AdminPaymentsQueryParams,
): Promise<AdminPaymentsPageResponse> {
  const response = await adminApi.get<ApiResponse<AdminPaymentsPageResponse>>(
    ADMIN_ROUTES.PAYMENTS,
    { params },
  );

  return response.data.data;
}

export async function getAdminPaymentDetail(
  paymentId: string,
): Promise<AdminPaymentDetail> {
  const response = await adminApi.get<ApiResponse<AdminPaymentDetail>>(
    ADMIN_ROUTES.PAYMENT_BY_ID(paymentId),
  );

  return response.data.data;
}

export async function getDriverPayments(
  params: DriverPaymentQueryParams,
): Promise<DriverPaymentPageResponse> {
  const response = await paymentApi.get<ApiResponse<DriverPaymentPageResponse>>(
    PAYMENT_ROUTES.ME,
    { params },
  );

  return response.data.data;
}

export async function getDriverPaymentDetail(
  paymentId: string,
): Promise<DriverPaymentHistoryItem> {
  const response = await paymentApi.get<ApiResponse<DriverPaymentHistoryItem>>(
    PAYMENT_ROUTES.ME_BY_ID(paymentId),
  );

  return response.data.data;
}
