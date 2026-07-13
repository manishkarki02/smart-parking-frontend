import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { buildDriverPaymentColumns } from "@/features/payments/components/driver/driver-payment-columns";
import { useDriverPaymentDetail } from "@/features/payments/hooks/useDriverPaymentDetail";
import { useDriverPayments } from "@/features/payments/hooks/useDriverPayments";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type {
  DriverPaymentHistoryItem,
  PaymentRequest,
  PaymentResponse,
} from "@/features/payments/types/payment.types";
import {
  buildDriverPaymentListParams,
  DEFAULT_DRIVER_PAYMENT_FILTERS,
  EMPTY_DRIVER_PAYMENT_SUMMARY,
  getSelectedDriverPaymentId,
  type DriverPaymentFilters,
  type SelectionState,
} from "@/features/payments/utils/driver-payment-page.utils";

export function useDriverPaymentsPageState() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_DRIVER_PAYMENT_FILTERS);
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<SelectionState>({ mode: "auto" });
  const [receiptPayment, setReceiptPayment] =
    useState<DriverPaymentHistoryItem | null>(null);

  const listParams = useMemo(
    () => buildDriverPaymentListParams(filters, page),
    [filters, page],
  );
  const {
    data: paymentPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDriverPayments(listParams);

  const payments = paymentPage?.content ?? [];
  const selectedPaymentId = getSelectedDriverPaymentId(payments, selection);
  const {
    data: selectedPaymentDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useDriverPaymentDetail(selectedPaymentId);

  const {
    mutate: initiateKhaltiPayment,
    isPending: isPaymentActionPending,
  } = useCustomMutation<PaymentRequest, PaymentResponse>({
    api: initiatePayment,
    onSuccess: (payment) => {
      if (payment.paymentUrl) {
        window.location.assign(payment.paymentUrl);
        return;
      }

      toast.info(payment.message || "Payment initiated.");
    },
    error: "Unable to start Khalti payment.",
  });

  const handlePayNow = useCallback(
    (payment: DriverPaymentHistoryItem) => {
      if (payment.paymentUrl) {
        window.location.assign(payment.paymentUrl);
        return;
      }

      if (!payment.bookingId) {
        toast.error("This payment is missing a booking reference.");
        return;
      }

      initiateKhaltiPayment({
        bookingId: payment.bookingId,
        paymentMethod: "KHALTI",
      });
    },
    [initiateKhaltiPayment],
  );

  const columns = useMemo(
    () =>
      buildDriverPaymentColumns({
        onReceiptClick: setReceiptPayment,
        onPayClick: handlePayNow,
        isPaymentActionPending,
      }),
    [handlePayNow, isPaymentActionPending],
  );

  const compactColumns = useMemo(
    () => [columns[0], columns[2], columns[4], columns[5]],
    [columns],
  );

  function updateFilters(nextFilters: Partial<DriverPaymentFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
    setPage(0);
    setSelection({ mode: "auto" });
  }

  function selectPayment(payment: DriverPaymentHistoryItem) {
    setSelection((current) =>
      current.mode === "selected" && current.id === payment.paymentId
        ? { mode: "closed" }
        : { mode: "selected", id: payment.paymentId },
    );
  }

  function closeDetail() {
    setSelection({ mode: "closed" });
  }

  function changePage(nextPage: number) {
    setPage(nextPage - 1);
    setSelection({ mode: "auto" });
  }

  function handleViewBooking(payment: DriverPaymentHistoryItem) {
    if (payment.bookingId) {
      void navigate({ to: "/bookings" });
    }
  }

  function closeReceiptDialog(open: boolean) {
    if (!open) {
      setReceiptPayment(null);
    }
  }

  return {
    filters,
    paymentPage,
    payments,
    summary: paymentPage?.summary ?? EMPTY_DRIVER_PAYMENT_SUMMARY,
    columns,
    compactColumns,
    selectedPaymentId,
    selectedPaymentDetail,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isDetailLoading,
    isDetailError,
    isPaymentActionPending,
    receiptPayment,
    currentPage: (paymentPage?.page ?? page) + 1,
    totalItems: paymentPage?.totalElements ?? 0,
    totalPages: paymentPage?.totalPages,
    updateFilters,
    selectPayment,
    closeDetail,
    changePage,
    handlePayNow,
    handleViewBooking,
    setReceiptPayment,
    closeReceiptDialog,
  };
}
