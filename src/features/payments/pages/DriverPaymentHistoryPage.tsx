import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
  type DataTableColumn,
} from "@/common";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { initiatePayment } from "@/features/payments/services/payment.service";
import {
  PaymentSuccessTicketDialog,
  type PaymentSuccessDetails,
} from "@/features/payments/components/PaymentSuccessTicketDialog";
import { useDriverPaymentDetail } from "@/features/payments/hooks/useDriverPaymentDetail";
import { useDriverPayments } from "@/features/payments/hooks/useDriverPayments";
import type {
  DriverPaymentHistoryItem,
  DriverPaymentQueryParams,
  DriverPaymentSummary,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  RefundStatus,
} from "@/features/payments/types/payment.types";
import {
  formatPaymentCurrency,
  formatPaymentDateTime,
  formatPaymentDuration,
  formatVehicleType,
  truncatePaymentId,
} from "@/features/payments/utils/payment.utils";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | PaymentStatus;
type DateFilter = "ALL" | "LAST_7" | "LAST_30";
type SelectionState =
  | { mode: "auto" }
  | { mode: "closed" }
  | { mode: "selected"; id: string };

type DriverPaymentFilters = {
  search: string;
  status: StatusFilter;
  dateRange: DateFilter;
};

const DEFAULT_FILTERS: DriverPaymentFilters = {
  search: "",
  status: "ALL",
  dateRange: "ALL",
};

const PAGE_SIZE = 10;

export function DriverPaymentHistoryPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<SelectionState>({ mode: "auto" });
  const [receiptPayment, setReceiptPayment] =
    useState<DriverPaymentHistoryItem | null>(null);
  const listParams = useMemo(
    () => buildListParams(filters, page),
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
  const selectedPaymentId = getSelectedPaymentId(payments, selection);
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
  const summary = paymentPage?.summary ?? EMPTY_SUMMARY;
  const handlePayNow = useCallback((payment: DriverPaymentHistoryItem) => {
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
  }, [initiateKhaltiPayment]);
  const columns = useMemo(
    () =>
      buildPaymentColumns({
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
  const headerContent = (
    <div className="min-w-0">
      <p className="truncate text-lg font-semibold tracking-tight text-foreground">
        Payment History
      </p>
      <p className="hidden truncate text-xs text-muted-foreground sm:block">
        View all your parking payment transactions and receipts
      </p>
    </div>
  );
  const headerActions = (
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
          content={headerContent}
          action={headerActions}
        />

        {isLoading && !paymentPage ? (
          <DriverPaymentsSkeleton />
        ) : isError ? (
          <PaymentErrorState
            error={error}
            isFetching={isFetching}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <PaymentSummaryCard
                title="Total Spent"
                value={formatPaymentCurrency(summary.totalSpent)}
                helper={`Across ${summary.totalPaymentCount} payments`}
                icon={<WalletCards className="size-5" aria-hidden="true" />}
                tone="blue"
              />
              <PaymentSummaryCard
                title="Successful Payments"
                value={summary.successfulPaymentCount}
                helper={`${formatPaymentCurrency(summary.successfulAmount)} paid`}
                icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
                tone="green"
              />
              <PaymentSummaryCard
                title="Pending Payments"
                value={summary.pendingPaymentCount}
                helper={`${formatPaymentCurrency(summary.pendingAmount)} outstanding`}
                icon={<Clock className="size-5" aria-hidden="true" />}
                tone="amber"
              />
              <PaymentSummaryCard
                title="Failed Payments"
                value={summary.failedPaymentCount}
                helper={`${formatPaymentCurrency(summary.failedAmount)} failed`}
                icon={<XCircle className="size-5" aria-hidden="true" />}
                tone="red"
              />
            </section>

            <SplitDataTable
              columns={columns}
              compactColumns={compactColumns}
              rows={payments}
              getRowId={(payment) => payment.paymentId}
              selectedRowId={selectedPaymentId}
              onRowSelect={(payment) =>
                setSelection((current) =>
                  current.mode === "selected" && current.id === payment.paymentId
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
              emptyState={
                <TableEmptyState
                  title="No payment history yet"
                  description="Your parking payments will appear here after you book and pay for a slot."
                  action={
                    <Button asChild>
                      <Link to="/parkings/map">Find Parking</Link>
                    </Button>
                  }
                />
              }
              toolbar={
                <DriverPaymentToolbar
                  filters={filters}
                  onFiltersChange={updateFilters}
                />
              }
              pagination={
                <DataTablePagination
                  page={(paymentPage?.page ?? page) + 1}
                  pageSize={PAGE_SIZE}
                  totalItems={paymentPage?.totalElements ?? 0}
                  totalPages={paymentPage?.totalPages}
                  pageSizeOptions={[PAGE_SIZE]}
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
        payment={receiptPayment ? toReceiptPayment(receiptPayment) : {}}
        booking={receiptPayment ? toReceiptBooking(receiptPayment) : undefined}
        onOpenChange={(open) => {
          if (!open) {
            setReceiptPayment(null);
          }
        }}
      />
    </>
  );
}

const EMPTY_SUMMARY: DriverPaymentSummary = {
  totalSpent: 0,
  totalPaymentCount: 0,
  successfulPaymentCount: 0,
  successfulAmount: 0,
  pendingPaymentCount: 0,
  pendingAmount: 0,
  failedPaymentCount: 0,
  failedAmount: 0,
};

function DriverPaymentToolbar({
  filters,
  onFiltersChange,
}: {
  filters: DriverPaymentFilters;
  onFiltersChange: (filters: Partial<DriverPaymentFilters>) => void;
}) {
  return (
    <Card className="rounded-lg border shadow-none">
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
            className="pl-9"
            placeholder="Search by payment ID, transaction ID, booking ID, or parking location..."
            aria-label="Search payments"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value: StatusFilter) => onFiltersChange({ status: value })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="SUCCESS">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.dateRange}
          onValueChange={(value: DateFilter) =>
            onFiltersChange({ dateRange: value })
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <CalendarDays className="size-4" aria-hidden="true" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All dates</SelectItem>
            <SelectItem value="LAST_7">Last 7 days</SelectItem>
            <SelectItem value="LAST_30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function buildPaymentColumns({
  onReceiptClick,
  onPayClick,
  isPaymentActionPending,
}: {
  onReceiptClick: (payment: DriverPaymentHistoryItem) => void;
  onPayClick: (payment: DriverPaymentHistoryItem) => void;
  isPaymentActionPending: boolean;
}): DataTableColumn<DriverPaymentHistoryItem>[] {
  return [
    {
      id: "paymentId",
      header: "Payment ID",
      className: "font-mono text-xs",
      cell: (payment) => (
        <span
          className="font-semibold text-blue-600"
          title={payment.paymentId}
        >
          {truncatePaymentId(payment.paymentId)}
        </span>
      ),
      compact: true,
    },
    {
      id: "transactionId",
      header: "Transaction ID",
      className: "font-mono text-xs",
      cell: (payment) => (
        <span title={payment.transactionId ?? undefined}>
          {truncatePaymentId(payment.transactionId)}
        </span>
      ),
    },
    {
      id: "parking",
      header: "Parking / Booking",
      cell: (payment) => (
        <div className="min-w-0">
          <p className="truncate font-medium" title={payment.booking.parkingLocationName ?? undefined}>
            {payment.booking.parkingLocationName ?? "Parking location"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {payment.booking.slotNumber ?? "No slot"} • {truncatePaymentId(payment.bookingId)}
          </p>
        </div>
      ),
    },
    {
      id: "method",
      header: "Method",
      cell: () => <KhaltiBadge />,
      compact: true,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (payment) => (
        <div className="min-w-0 text-right">
          <p className="font-semibold">{formatPaymentCurrency(payment.amount)}</p>
          <p className="text-xs text-muted-foreground">
            {formatAmountMeta(payment)}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (payment) => <PaymentStatusBadge status={payment.status} />,
      compact: true,
    },
    {
      id: "paidAt",
      header: "Paid At",
      cell: (payment) => formatPaidAt(payment),
    },
    {
      id: "action",
      header: "Receipt / Action",
      align: "right",
      cell: (payment) => (
        <PaymentRowAction
          payment={payment}
          isPending={isPaymentActionPending}
          onReceiptClick={onReceiptClick}
          onPayClick={onPayClick}
        />
      ),
    },
  ];
}

function PaymentRowAction({
  payment,
  isPending,
  onReceiptClick,
  onPayClick,
}: {
  payment: DriverPaymentHistoryItem;
  isPending: boolean;
  onReceiptClick: (payment: DriverPaymentHistoryItem) => void;
  onPayClick: (payment: DriverPaymentHistoryItem) => void;
}) {
  if (payment.status === "SUCCESS") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onReceiptClick(payment)}
      >
        <Receipt className="size-4" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">View Receipt</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={payment.status === "FAILED" ? "outline" : "default"}
      disabled={isPending}
      onClick={() => onPayClick(payment)}
    >
      {payment.status === "FAILED" ? "Retry" : "Pay Now"}
    </Button>
  );
}

function DriverPaymentDetailPanel({
  payment,
  isLoading,
  isError,
  isActionPending,
  onClose,
  onPayNow,
  onReceiptClick,
  onViewBooking,
}: {
  payment: DriverPaymentHistoryItem | undefined;
  isLoading: boolean;
  isError: boolean;
  isActionPending: boolean;
  onClose: () => void;
  onPayNow: (payment: DriverPaymentHistoryItem) => void;
  onReceiptClick: (payment: DriverPaymentHistoryItem) => void;
  onViewBooking: (payment: DriverPaymentHistoryItem) => void;
}) {
  if (isLoading) {
    return (
      <SplitDetailPanel title="Payment Detail" onClose={onClose}>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SplitDetailPanel>
    );
  }

  if (isError) {
    return (
      <SplitDetailPanel title="Payment Detail" onClose={onClose}>
        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-destructive">
          Could not load payment detail.
        </div>
      </SplitDetailPanel>
    );
  }

  if (!payment) {
    return (
      <SplitDetailPanel title="Payment Detail" onClose={onClose}>
        <TableEmptyState
          title="No payment selected"
          description="Select a payment row to view its transaction details."
        />
      </SplitDetailPanel>
    );
  }

  return (
    <SplitDetailPanel
      title="Payment Detail"
      subtitle={truncatePaymentId(payment.paymentId)}
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={payment.status} />
          <KhaltiBadge />
        </div>

        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-blue-700">
                {payment.status === "SUCCESS" ? "Amount Paid" : "Amount Due"}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-blue-700">
                {formatPaymentCurrency(payment.amount)}
              </p>
              <p className="mt-1 text-xs text-blue-700/80">via Khalti</p>
            </div>
            <CreditCard className="size-5 shrink-0 text-blue-600" aria-hidden="true" />
          </div>
        </section>

        <DetailSection title="Booking Info">
          <DetailPair label="Location" value={payment.booking.parkingLocationName ?? "-"} />
          <DetailPair
            label="Slot"
            value={
              payment.booking.slotNumber ? (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {payment.booking.slotNumber}
                </Badge>
              ) : (
                "-"
              )
            }
          />
          <DetailPair label="Vehicle" value={payment.booking.vehicleNumber ?? "-"} />
          <DetailPair
            label="Type"
            value={formatVehicleType(payment.booking.vehicleType)}
          />
          <DetailPair
            label="Booking ID"
            value={truncatePaymentId(payment.bookingId)}
            title={payment.bookingId ?? undefined}
          />
        </DetailSection>

        <DetailSection title="Timing">
          <DetailPair label="Start" value={formatPaymentDateTime(payment.booking.startTime)} />
          <DetailPair label="End" value={formatPaymentDateTime(payment.booking.endTime)} />
          <DetailPair
            label="Duration"
            value={formatPaymentDuration(payment.booking.durationMinutes)}
          />
          <DetailPair
            label="Rate"
            value={
              typeof payment.booking.ratePerHour === "number"
                ? `${formatPaymentCurrency(payment.booking.ratePerHour)}/hr`
                : "-"
            }
          />
        </DetailSection>

        <DetailSection title="Transaction">
          <DetailPair label="Method" value={<KhaltiBadge />} />
          <DetailPair
            label="Transaction ID"
            value={truncatePaymentId(payment.transactionId)}
            title={payment.transactionId ?? undefined}
          />
          <DetailPair
            label="Khalti PIDX"
            value={truncatePaymentId(payment.pidx)}
            title={payment.pidx ?? undefined}
          />
          <DetailPair label="Paid At" value={formatPaymentDateTime(payment.paidAt)} />
          <DetailPair label="Message" value={payment.message ?? "-"} />
        </DetailSection>

        <DetailSection title="Refund">
          <DetailPair
            label="Status"
            value={<RefundStatusBadge status={payment.refund.refundStatus} />}
          />
          <DetailPair
            label="Eligible"
            value={payment.refund.refundEligible ? "Eligible" : "Not eligible"}
          />
          <DetailPair
            label="Amount"
            value={formatPaymentCurrency(payment.refund.refundAmount ?? 0)}
          />
        </DetailSection>

        <div className="space-y-2 border-t pt-4">
          {payment.status === "SUCCESS" ? (
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => onReceiptClick(payment)}
            >
              <Receipt className="size-4" aria-hidden="true" />
              View Receipt
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full"
              disabled={isActionPending}
              onClick={() => onPayNow(payment)}
            >
              {payment.status === "FAILED" ? "Retry Payment" : "Pay Now"}
            </Button>
          )}
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={() => onViewBooking(payment)}
          >
            View Booking
          </Button>
        </div>
      </div>
    </SplitDetailPanel>
  );
}

function PaymentSummaryCard({
  title,
  value,
  helper,
  icon,
  tone,
}: {
  title: string;
  value: ReactNode;
  helper: string;
  icon: ReactNode;
  tone: "blue" | "green" | "amber" | "red";
}) {
  return (
    <Card className="rounded-lg border shadow-none">
      <CardContent className="flex min-h-32 items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-3">
          <p className="truncate text-sm font-medium text-slate-600">{title}</p>
          <p className="truncate text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="truncate text-sm text-slate-500">{helper}</p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            tone === "blue" && "bg-blue-50 text-blue-600",
            tone === "green" && "bg-green-50 text-green-600",
            tone === "amber" && "bg-amber-50 text-amber-600",
            tone === "red" && "bg-red-50 text-red-600",
          )}
        >
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "SUCCESS" && "border-green-200 bg-green-50 text-green-700",
        status === "PENDING" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "FAILED" && "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {formatDriverPaymentStatus(status)}
    </Badge>
  );
}

function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "NONE" && "border-slate-200 bg-slate-50 text-slate-600",
        status === "PENDING" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "COMPLETED" && "border-green-200 bg-green-50 text-green-700",
        status === "FAILED" && "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {formatRefundStatus(status)}
    </Badge>
  );
}

function KhaltiBadge() {
  return (
    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
      Khalti
    </Badge>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailPair({
  label,
  value,
  title,
}: {
  label: string;
  value?: ReactNode;
  title?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div className="min-w-0 justify-self-end break-words text-right font-medium" title={title}>
        {value || "-"}
      </div>
    </div>
  );
}

function PaymentErrorState({
  error,
  isFetching,
  onRetry,
}: {
  error: unknown;
  isFetching: boolean;
  onRetry: () => void;
}) {
  const message = getApiErrorMessage(error);
  const readableMessage = Array.isArray(message) ? message.join(", ") : message;

  return (
    <Card className="rounded-lg border shadow-none">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <RefreshCw className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Unable to load payment history</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {readableMessage || "Please try again."}
          </p>
        </div>
        <Button type="button" onClick={onRetry} disabled={isFetching}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function DriverPaymentsSkeleton() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-lg border shadow-none">
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </section>
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

function buildListParams(
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
    size: PAGE_SIZE,
    sort: "paidAt,desc",
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

function getSelectedPaymentId(
  payments: DriverPaymentHistoryItem[],
  selection: SelectionState,
): string | null {
  if (selection.mode === "closed") {
    return null;
  }

  if (selection.mode === "selected") {
    return (
      payments.find((payment) => payment.paymentId === selection.id)?.paymentId ??
      payments[0]?.paymentId ??
      null
    );
  }

  return payments[0]?.paymentId ?? null;
}

function formatDriverPaymentStatus(status: PaymentStatus): string {
  if (status === "SUCCESS") {
    return "Paid";
  }

  if (status === "PENDING") {
    return "Pending";
  }

  return "Failed";
}

function formatRefundStatus(status: RefundStatus): string {
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

function formatPaidAt(payment: DriverPaymentHistoryItem): string {
  if (payment.status === "SUCCESS") {
    return formatPaymentDateTime(payment.paidAt);
  }

  return payment.status === "PENDING" ? "Awaiting payment" : "Payment failed";
}

function formatAmountMeta(payment: DriverPaymentHistoryItem): string {
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

function toReceiptPayment(payment: DriverPaymentHistoryItem): PaymentSuccessDetails {
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

function toReceiptBooking(payment: DriverPaymentHistoryItem): BookingResponse {
  return {
    bookingId: payment.booking.bookingId ?? payment.bookingId ?? "",
    vehicleNumber: payment.booking.vehicleNumber ?? undefined,
    walkIn: false,
    parkingLocationId: payment.booking.parkingLocationId ?? "",
    parkingLocationName: payment.booking.parkingLocationName ?? "Parking booking",
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
