import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Receipt,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";
import { TableEmptyState } from "@/common";
import { DetailItem as DetailPair } from "@/common/components/detail-panel/DetailItem";
import { DetailSection } from "@/common/components/detail-panel/DetailSection";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
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
import type {
  DriverPaymentHistoryItem,
  DriverPaymentSummary,
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
import type {
  DateFilter,
  DriverPaymentFilters,
  StatusFilter,
} from "@/features/payments/utils/driver-payment-page.utils";
import {
  formatDriverPaymentStatus,
  formatDriverRefundStatus,
} from "@/features/payments/utils/driver-payment-page.utils";
import { cn } from "@/lib/utils";

export function DriverPaymentSummaryCards({
  summary,
}: {
  summary: DriverPaymentSummary;
}) {
  return (
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
  );
}

export function DriverPaymentToolbar({
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
            onChange={(event) =>
              onFiltersChange({ search: event.target.value })
            }
            className="pl-9"
            placeholder="Search by payment ID, transaction ID, booking ID, or parking location..."
            aria-label="Search payments"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value: StatusFilter) =>
            onFiltersChange({ status: value })
          }
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

export function DriverPaymentDetailPanel({
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
            <CreditCard
              className="size-5 shrink-0 text-blue-600"
              aria-hidden="true"
            />
          </div>
        </section>

        <DetailSection title="Booking Info">
          <DetailPair
            label="Location"
            value={payment.booking.parkingLocationName ?? "-"}
          />
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
          <DetailPair
            label="Vehicle"
            value={payment.booking.vehicleNumber ?? "-"}
          />
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
          <DetailPair
            label="Start"
            value={formatPaymentDateTime(payment.booking.startTime)}
          />
          <DetailPair
            label="End"
            value={formatPaymentDateTime(payment.booking.endTime)}
          />
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
          <DetailPair
            label="Paid At"
            value={formatPaymentDateTime(payment.paidAt)}
          />
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

export function DriverPaymentsSkeleton() {
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

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
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
      {formatDriverRefundStatus(status)}
    </Badge>
  );
}

export function KhaltiBadge() {
  return (
    <Badge
      variant="outline"
      className="border-purple-200 bg-purple-50 text-purple-700"
    >
      Khalti
    </Badge>
  );
}
