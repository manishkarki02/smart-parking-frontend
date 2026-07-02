import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Globe2,
  MapPin,
  Timer,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
import { cn } from "@/lib/utils";
import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";
import {
  formatAdminBookingCurrency,
  formatAdminBookingDateTime,
  formatAdminBookingDuration,
  formatAdminBookingStatusLabel,
  formatAdminPaymentMethodLabel,
  formatAdminPaymentStatusLabel,
  formatAdminVehicleTypeLabel,
  getAdminBookingCustomerName,
  getAdminBookingCustomerPhone,
  getAdminBookingDisplayStatus,
  getAdminBookingPaymentStatus,
  getAdminBookingStatusTone,
  getAdminPaymentStatusTone,
  truncateAdminBookingId,
} from "@/features/bookings/utils/admin-booking.utils";

type AdminBookingDetailPanelProps = {
  booking: AdminBooking | null;
  onClose: () => void;
};

export function AdminBookingDetailPanel({
  booking,
  onClose,
}: AdminBookingDetailPanelProps) {
  if (!booking) {
    return (
      <div className="rounded-lg border bg-card">
        <Empty className="min-h-105 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRound aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No booking selected</EmptyTitle>
            <EmptyDescription>
              Select a booking row to view its details.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const bookingStatus = getAdminBookingDisplayStatus(booking);
  const paymentStatus = getAdminBookingPaymentStatus(booking);

  return (
    <SplitDetailPanel
      title="Booking Detail"
      subtitle={truncateAdminBookingId(booking.bookingId)}
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-lg bg-muted/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={getAdminBookingStatusTone(bookingStatus)}
              className={getBookingStatusClassName(bookingStatus)}
            >
              {formatAdminBookingStatusLabel(bookingStatus)}
            </Badge>
            <Badge
              variant={getAdminPaymentStatusTone(paymentStatus)}
              className={getPaymentStatusClassName(paymentStatus)}
            >
              {paymentStatus === "SUCCESS"
                ? "Payment Paid"
                : formatAdminPaymentStatusLabel(paymentStatus)}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatAdminBookingCurrency(booking.totalAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Source</p>
              <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700">
                <Globe2 aria-hidden="true" />
                {booking.walkIn ? "Walk-in" : "Online"}
              </Badge>
            </div>
          </div>
        </section>

        <DetailSection icon={UserRound} title={booking.walkIn ? "Customer" : "Driver"}>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {getBookingInitials(booking)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {getAdminBookingCustomerName(booking)}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {getAdminBookingCustomerPhone(booking)}
              </p>
            </div>
          </div>
          <DetailRow
            label="Customer Name"
            value={getAdminBookingCustomerName(booking)}
          />
          <DetailRow label="Phone" value={getAdminBookingCustomerPhone(booking)} />
          <DetailRow
            label="Vehicle No."
            value={booking.vehicleNumber ?? "No vehicle number"}
          />
          <DetailRow
            label="Vehicle Type"
            value={
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {formatAdminVehicleTypeLabel(booking.vehicleType)}
              </Badge>
            }
          />
        </DetailSection>

        <DetailSection icon={MapPin} title="Parking Location">
          <DetailRow label="Location" value={booking.parkingLocationName} />
          <DetailRow
            label="Slot"
            value={
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {booking.slotNumber}
              </Badge>
            }
          />
          <DetailRow label="Vendor" value="N/A" />
        </DetailSection>

        <DetailSection icon={Timer} title="Timeline">
          <div className="space-y-5">
            <TimelineRow
              label="Booking start"
              value={formatAdminBookingDateTime(booking.startTime)}
              tone="blue"
            />
            <TimelineRow
              label="Expected end"
              value={formatAdminBookingDateTime(booking.endTime)}
              tone="orange"
            />
            {booking.cancelledAt ? (
              <TimelineRow
                label="Cancelled"
                value={formatAdminBookingDateTime(booking.cancelledAt)}
                tone="red"
              />
            ) : null}
            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              Duration:{" "}
              {formatAdminBookingDuration(booking.startTime, booking.endTime)}
            </div>
          </div>
        </DetailSection>

        <DetailSection icon={CreditCard} title="Payment">
          {booking.paymentId || booking.paymentStatus || booking.paymentMethod ? (
            <>
              <DetailRow
                label="Payment ID"
                value={truncateOptionalId(booking.paymentId)}
                title={booking.paymentId ?? undefined}
              />
              <DetailRow
                label="Method"
                value={
                  <Badge
                    variant="secondary"
                    className={getPaymentMethodClassName(booking.paymentMethod)}
                  >
                    {formatAdminPaymentMethodLabel(booking.paymentMethod)}
                  </Badge>
                }
              />
              <DetailRow
                label="Status"
                value={
                  <Badge
                    variant={getAdminPaymentStatusTone(paymentStatus)}
                    className={getPaymentStatusClassName(paymentStatus)}
                  >
                    {formatAdminPaymentStatusLabel(paymentStatus)}
                  </Badge>
                }
              />
              <DetailRow
                label="Paid At"
                value={formatAdminBookingDateTime(booking.paidAt)}
              />
            </>
          ) : (
            <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              No payment record
            </div>
          )}
        </DetailSection>

        <DetailSection title="Admin Actions">
          <div className="space-y-2">
            {booking.paymentId ? (
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link to="/admin/payments">
                  <CreditCard aria-hidden="true" />
                  View Payment Record
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              disabled
              title="Booking deletion is not available from this page yet."
            >
              <Trash2 aria-hidden="true" />
              Delete Booking
            </Button>
          </div>
        </DetailSection>
      </div>
    </SplitDetailPanel>
  );
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-t pt-5">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon ? (
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        ) : null}
        {title}
      </h3>
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
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] items-start gap-4 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div
        className="min-w-0 justify-self-end wrap-break-word text-right font-semibold"
        title={title}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function TimelineRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "orange" | "red";
}) {
  return (
    <div className="relative pl-6">
      <span
        className={cn(
          "absolute left-0 top-1.5 size-2.5 rounded-full",
          tone === "blue" && "bg-blue-600",
          tone === "orange" && "bg-orange-500",
          tone === "red" && "bg-red-500",
        )}
      />
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function getBookingInitials(booking: AdminBooking): string {
  return getAdminBookingCustomerName(booking)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "U";
}

function truncateOptionalId(id?: string | null): string {
  return id ? truncateAdminBookingId(id) : "N/A";
}

function getBookingStatusClassName(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "CANCELLED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "PENDING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "OCCUPIED":
    case "CONFIRMED":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    default:
      return "";
  }
}

function getPaymentStatusClassName(status: string): string {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "FAILED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "PENDING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "N_A":
      return "bg-muted text-muted-foreground hover:bg-muted";
    default:
      return "";
  }
}

function getPaymentMethodClassName(
  method: AdminBooking["paymentMethod"],
): string {
  switch (method) {
    case "KHALTI":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "CASH":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "ESEWA":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}
