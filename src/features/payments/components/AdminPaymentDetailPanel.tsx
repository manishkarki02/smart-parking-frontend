import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CreditCard, MapPin, Receipt, RotateCcw, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
import { cn } from "@/lib/utils";
import type { AdminPaymentDetail } from "@/features/payments/types/payment.types";
import {
  formatBookingSource,
  formatPaymentCurrency,
  formatPaymentDateTime,
  formatPaymentDuration,
  formatPaymentMethod,
  formatPaymentStatus,
  formatVehicleType,
  getPaymentInitials,
  getPaymentMethodBadgeVariant,
  getPaymentStatusBadgeVariant,
  truncatePaymentId,
} from "@/features/payments/utils/payment.utils";

type AdminPaymentDetailPanelProps = {
  payment: AdminPaymentDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
};

export function AdminPaymentDetailPanel({
  payment,
  isLoading,
  isError,
  onClose,
}: AdminPaymentDetailPanelProps) {
  if (isLoading) {
    return <AdminPaymentDetailSkeleton onClose={onClose} />;
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
      <div className="rounded-lg border bg-card">
        <Empty className="min-h-[420px] border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No payment selected</EmptyTitle>
            <EmptyDescription>
              Select a payment row to view its details.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <SplitDetailPanel
      title="Payment Detail"
      subtitle={
        <Badge
          variant={getPaymentStatusBadgeVariant(payment.status)}
          className={getStatusBadgeClassName(payment.status)}
        >
          {formatPaymentStatus(payment.status)}
        </Badge>
      }
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-lg bg-muted/40 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Amount Paid
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatPaymentCurrency(payment.amount)}
              </p>
            </div>
            <Badge
              variant={getPaymentMethodBadgeVariant(payment.method)}
              className={getMethodBadgeClassName(payment.method)}
            >
              {formatPaymentMethod(payment.method)}
            </Badge>
          </div>
        </section>

        <DetailSection icon={CreditCard} title="Payment Info">
          <DetailRow label="Payment ID" value={truncatePaymentId(payment.paymentId)} title={payment.paymentId} />
          <DetailRow label="Booking ID" value={truncatePaymentId(payment.bookingId)} title={payment.bookingId ?? undefined} />
          <DetailRow label="Transaction ID" value={truncatePaymentId(payment.transactionId)} title={payment.transactionId ?? undefined} />
          <DetailRow label="Khalti PIDX" value={truncatePaymentId(payment.khaltiPidx)} title={payment.khaltiPidx ?? undefined} />
          <DetailRow label="Paid At" value={formatPaymentDateTime(payment.paidAt)} />
        </DetailSection>

        <DetailSection icon={UserRound} title="Customer">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {getPaymentInitials(payment.customer.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">
                {payment.customer.name ?? "Unknown customer"}
              </p>
              <p className="truncate text-xs font-medium uppercase text-muted-foreground">
                {payment.customer.role ?? "WALK_IN"}
              </p>
            </div>
          </div>
          <DetailRow label="Phone" value={payment.customer.phone ?? "-"} />
          <DetailRow label="Email" value={payment.customer.email ?? "-"} />
          <DetailRow
            label="Vehicle No."
            value={
              payment.customer.vehicleNumber ??
              payment.booking.vehicleNumber ??
              "-"
            }
          />
        </DetailSection>

        <DetailSection icon={MapPin} title="Parking & Slot">
          <DetailRow label="Location" value={payment.parking.name ?? "-"} />
          <DetailRow
            label="Slot"
            value={
              payment.parking.slotCode ? (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {payment.parking.slotCode}
                </Badge>
              ) : (
                "-"
              )
            }
          />
          <DetailRow
            label="Vehicle Type"
            value={formatVehicleType(payment.booking.vehicleType)}
          />
          <DetailRow label="Vendor" value={payment.parking.vendorName ?? "-"} />
        </DetailSection>

        <DetailSection icon={Receipt} title="Booking Timeline">
          <DetailRow label="Start" value={formatPaymentDateTime(payment.booking.startTime)} />
          <DetailRow label="End" value={formatPaymentDateTime(payment.booking.endTime)} />
          <DetailRow
            label="Duration"
            value={formatPaymentDuration(payment.booking.durationMinutes)}
          />
          <DetailRow
            label="Source"
            value={
              payment.booking.source ? (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {formatBookingSource(payment.booking.source)}
                </Badge>
              ) : (
                "-"
              )
            }
          />
        </DetailSection>

        <DetailSection icon={RotateCcw} title="Refund">
          {payment.refund ? (
            <div
              className={cn(
                "rounded-lg p-4",
                payment.refund.eligible
                  ? "bg-green-50 text-green-800"
                  : "bg-muted/40 text-muted-foreground",
              )}
            >
              <p className="text-sm font-semibold">
                {payment.refund.eligible ? "Refund Eligible" : "Not Eligible"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatPaymentCurrency(payment.refund.amount ?? 0)}
              </p>
              <p className="mt-1 text-sm">
                Status: {payment.refund.status ?? "-"}
              </p>
              {payment.refund.reason ? (
                <p className="mt-2 text-xs">{payment.refund.reason}</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              No refund information
            </div>
          )}
        </DetailSection>
      </div>
    </SplitDetailPanel>
  );
}

function AdminPaymentDetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <SplitDetailPanel title="Payment Detail" onClose={onClose}>
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </SplitDetailPanel>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0">
      <SectionTitle icon={icon} title={title} />
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  title,
}: {
  label: string;
  value?: ReactNode;
  title?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div
        className="min-w-0 justify-self-end break-words text-right font-medium"
        title={title}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      {title}
    </h3>
  );
}

function getStatusBadgeClassName(status: AdminPaymentDetail["status"]): string {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "FAILED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "PENDING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  }
}

function getMethodBadgeClassName(method: AdminPaymentDetail["method"]): string {
  switch (method) {
    case "KHALTI":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "CASH":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "ESEWA":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  }
}
