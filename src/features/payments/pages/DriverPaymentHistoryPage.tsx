import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { MapPin, ReceiptText } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { QueryErrorState } from "@/common/components/feedback/QueryErrorState";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { Button } from "@/components/ui/button";
import {
  DriverPaymentDetailPanel,
  DriverPaymentsSkeleton,
  DriverPaymentSummaryCards,
  DriverPaymentToolbar,
} from "@/features/payments/components/driver/DriverPaymentHistorySections";
import { buildDriverPaymentColumns } from "@/features/payments/components/driver/driver-payment-columns";
import {
  PaymentSuccessTicketDialog,
} from "@/features/payments/components/PaymentSuccessTicketDialog";
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
  DRIVER_PAYMENT_PAGE_SIZE,
  EMPTY_DRIVER_PAYMENT_SUMMARY,
  getSelectedDriverPaymentId,
  type DriverPaymentFilters,
  type SelectionState,
  toDriverReceiptBooking,
  toDriverReceiptPayment,
} from "@/features/payments/utils/driver-payment-page.utils";

export function DriverPaymentHistoryPage() {
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
  } = useDriverPayments(listParams, true);

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

  const summary = paymentPage?.summary ?? EMPTY_DRIVER_PAYMENT_SUMMARY;

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

  function handleViewBooking(payment: DriverPaymentHistoryItem) {
    if (payment.bookingId) {
      void navigate({ to: "/bookings" });
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PageHeader
          title="Payment History"
          content={<DriverPaymentsHeaderContent />}
          action={<DriverPaymentsHeaderActions />}
        />

        {isLoading && !paymentPage ? (
          <DriverPaymentsSkeleton />
        ) : isError ? (
          <QueryErrorState
            title="Unable to load payment history"
            message={readPaymentErrorMessage(error)}
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <DriverPaymentSummaryCards summary={summary} />

            <SplitDataTable
              columns={columns}
              compactColumns={compactColumns}
              rows={payments}
              getRowId={(payment) => payment.paymentId}
              selectedRowId={selectedPaymentId}
              onRowSelect={(payment) =>
                setSelection((current) =>
                  current.mode === "selected" &&
                  current.id === payment.paymentId
                    ? { mode: "closed" }
                    : { mode: "selected", id: payment.paymentId },
                )
              }
              onDetailClose={() => setSelection({ mode: "closed" })}
              detailTitle="Payment Detail"
              detailPanel={
                <DriverPaymentDetailPanel
                  payment={selectedPaymentDetail}
                  isLoading={isDetailLoading}
                  isError={isDetailError}
                  isActionPending={isPaymentActionPending}
                  onClose={() => setSelection({ mode: "closed" })}
                  onPayNow={handlePayNow}
                  onReceiptClick={setReceiptPayment}
                  onViewBooking={handleViewBooking}
                />
              }
              isLoading={isLoading}
              loadingRowCount={6}
              splitContainerClassName="min-h-[560px]"
              emptyState={<DriverPaymentsEmptyState />}
              toolbar={
                <DriverPaymentToolbar
                  filters={filters}
                  onFiltersChange={updateFilters}
                />
              }
              pagination={
                <DataTablePagination
                  page={(paymentPage?.page ?? page) + 1}
                  pageSize={DRIVER_PAYMENT_PAGE_SIZE}
                  totalItems={paymentPage?.totalElements ?? 0}
                  totalPages={paymentPage?.totalPages}
                  pageSizeOptions={[DRIVER_PAYMENT_PAGE_SIZE]}
                  onPageChange={(nextPage) => {
                    setPage(nextPage - 1);
                    setSelection({ mode: "auto" });
                  }}
                  onPageSizeChange={() => undefined}
                />
              }
            />
          </>
        )}
      </div>

      <PaymentSuccessTicketDialog
        open={Boolean(receiptPayment)}
        payment={receiptPayment ? toDriverReceiptPayment(receiptPayment) : {}}
        booking={
          receiptPayment ? toDriverReceiptBooking(receiptPayment) : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setReceiptPayment(null);
          }
        }}
      />
    </>
  );
}

function DriverPaymentsHeaderContent() {
  return (
    <div className="min-w-0">
      <p className="truncate text-lg font-semibold tracking-tight text-foreground">
        Payment History
      </p>
      <p className="hidden truncate text-xs text-muted-foreground sm:block">
        View all your parking payment transactions and receipts
      </p>
    </div>
  );
}

function DriverPaymentsHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link to="/bookings">
          <ReceiptText className="size-4" aria-hidden="true" />
          My Bookings
        </Link>
      </Button>
      <Button asChild>
        <Link to="/parkings/map">
          <MapPin className="size-4" aria-hidden="true" />
          Find Parking
        </Link>
      </Button>
    </div>
  );
}

function DriverPaymentsEmptyState() {
  return (
    <TableEmptyState
      title="No payment history yet"
      description="Your parking payments will appear here after you book and pay for a slot."
      action={
        <Button asChild>
          <Link to="/parkings/map">Find Parking</Link>
        </Button>
      }
    />
  );
}

function readPaymentErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error);
  const readableMessage = Array.isArray(message) ? message.join(", ") : message;
  return readableMessage || "Please try again.";
}
