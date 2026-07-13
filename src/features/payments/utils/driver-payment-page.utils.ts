import type { BookingResponse } from "@/features/bookings/types/booking.types";
import type { PaymentSuccessDetails } from "@/features/payments/components/PaymentSuccessTicketDialog";
import type {
  DriverPaymentHistoryItem,
  DriverPaymentQueryParams,
  DriverPaymentSummary,
  PaymentStatus,
  RefundStatus,
} from "@/features/payments/types/payment.types";
import {
  formatPaymentCurrency,
  formatPaymentDateTime,
  formatPaymentDuration,
} from "@/features/payments/utils/payment.utils";

export type StatusFilter = "ALL" | PaymentStatus;
export type DateFilter = "ALL" | "LAST_7" | "LAST_30";
export type SelectionState =
  | { mode: "auto" }
  | { mode: "closed" }
  | { mode: "selected"; id: string };

export type DriverPaymentFilters = {
  search: string;
  status: StatusFilter;
  dateRange: DateFilter;
};

export const DEFAULT_DRIVER_PAYMENT_FILTERS: DriverPaymentFilters = {
  search: "",
  status: "ALL",
  dateRange: "ALL",
};

export const DRIVER_PAYMENT_PAGE_SIZE = 10;

export const EMPTY_DRIVER_PAYMENT_SUMMARY: DriverPaymentSummary = {
  totalSpent: 0,
  totalPaymentCount: 0,
  successfulPaymentCount: 0,
  successfulAmount: 0,
  pendingPaymentCount: 0,
  pendingAmount: 0,
  failedPaymentCount: 0,
  failedAmount: 0,
};

export function buildDriverPaymentListParams(
  filters: DriverPaymentFilters,
  page: number,
): DriverPaymentQueryParams {
  const dateRange = resolveDateRange(filters.dateRange);

  return {
    search: filters.search.trim() || undefined,
    status: filters.status === "ALL" ? undefined : filters.status,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    page,
    size: DRIVER_PAYMENT_PAGE_SIZE,
    sort: "paidAt,desc",
  };
}

export function getSelectedDriverPaymentId(
  payments: DriverPaymentHistoryItem[],
  selection: SelectionState,
): string | null {
  if (selection.mode === "closed") {
    return null;
  }

  if (selection.mode === "selected") {
    return (
      payments.find((payment) => payment.paymentId === selection.id)
        ?.paymentId ??
      payments[0]?.paymentId ??
      null
    );
  }

  return payments[0]?.paymentId ?? null;
}

export function formatDriverPaymentStatus(status: PaymentStatus): string {
  if (status === "SUCCESS") {
    return "Paid";
  }

  if (status === "PENDING") {
    return "Pending";
  }

  return "Failed";
}

export function formatDriverRefundStatus(status: RefundStatus): string {
  if (status === "NONE") {
    return "No Refund";
  }

  if (status === "PENDING") {
    return "Refund Pending";
  }

  if (status === "COMPLETED") {
    return "Refunded";
  }

  return "Refund Failed";
}

export function formatDriverPaymentPaidAt(
  payment: DriverPaymentHistoryItem,
): string {
  if (payment.status === "SUCCESS") {
    return formatPaymentDateTime(payment.paidAt);
  }

  return payment.status === "PENDING" ? "Awaiting payment" : "Payment failed";
}

export function formatDriverPaymentAmountMeta(
  payment: DriverPaymentHistoryItem,
): string {
  const duration = formatPaymentDuration(payment.booking.durationMinutes);
  const rate =
    typeof payment.booking.ratePerHour === "number"
      ? formatPaymentCurrency(payment.booking.ratePerHour)
      : null;

  if (duration !== "-" && rate) {
    return `${duration} x ${rate}/hr`;
  }

  return duration !== "-" ? duration : "Parking payment";
}

export function toDriverReceiptPayment(
  payment: DriverPaymentHistoryItem,
): PaymentSuccessDetails {
  return {
    paymentSuccess: payment.status === "SUCCESS",
    bookingId: payment.bookingId ?? undefined,
    paymentId: payment.paymentId,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    amount: payment.amount,
    transactionId: payment.transactionId ?? undefined,
    paidAt: payment.paidAt ?? undefined,
    pidx: payment.pidx ?? undefined,
    message: payment.message ?? undefined,
  };
}

export function toDriverReceiptBooking(
  payment: DriverPaymentHistoryItem,
): BookingResponse {
  return {
    bookingId: payment.booking.bookingId ?? payment.bookingId ?? "",
    vehicleNumber: payment.booking.vehicleNumber ?? undefined,
    walkIn: false,
    parkingLocationId: payment.booking.parkingLocationId ?? "",
    parkingLocationName:
      payment.booking.parkingLocationName ?? "Parking booking",
    slotId: payment.booking.slotId ?? "",
    slotNumber: payment.booking.slotNumber ?? "-",
    vehicleType: payment.booking.vehicleType ?? "TWO_WHEELER",
    status: payment.booking.status ?? "CONFIRMED",
    startTime: payment.booking.startTime ?? "",
    endTime: payment.booking.endTime ?? "",
    totalAmount: payment.booking.totalAmount ?? payment.amount,
    paymentId: payment.paymentId,
    paymentStatus: payment.status,
    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt ?? undefined,
  };
}

function resolveDateRange(dateRange: DateFilter): {
  fromDate?: string;
  toDate?: string;
} {
  if (dateRange === "ALL") {
    return {};
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - (dateRange === "LAST_7" ? 6 : 29));

  return {
    fromDate: toDateInputValue(from),
    toDate: toDateInputValue(today),
  };
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
