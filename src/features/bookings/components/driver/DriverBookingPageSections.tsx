import {
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPinned,
  ReceiptText,
  Search,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
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
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import {
  formatBookingAmount,
  formatBookingDateTime,
  formatVehicleType,
} from "@/features/bookings/utils/booking-formatters";
import { cn } from "@/lib/utils";
import {
  canCancelDriverBooking,
  canPayForDriverBooking,
  driverBookingPaymentStatusLabel,
  formatDriverBookingDuration,
  getDriverBookingStats,
  type DriverBookingDateFilter,
  type DriverBookingPaymentFilter,
  type DriverBookingStatusFilter,
} from "@/features/bookings/utils/driver-booking-page.utils";

export function DriverBookingSummaryCards({
  bookings,
  loading,
}: {
  bookings: BookingResponse[];
  loading: boolean;
}) {
  const stats = getDriverBookingStats(bookings);

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard
        label="Active"
        value={stats.active}
        chip="Confirmed"
        chipClassName="border-blue-200 bg-blue-50 text-blue-700"
        icon={Clock3}
        iconClassName="bg-blue-50 text-blue-600"
        loading={loading}
      />
      <SummaryCard
        label="Upcoming"
        value={stats.upcoming}
        chip="Pending"
        chipClassName="border-amber-200 bg-amber-50 text-amber-700"
        icon={CalendarDays}
        iconClassName="bg-amber-50 text-amber-600"
        loading={loading}
      />
      <SummaryCard
        label="Completed"
        value={stats.completed}
        chip="Paid"
        chipClassName="border-green-200 bg-green-50 text-green-700"
        icon={CheckCircle2}
        iconClassName="bg-green-50 text-green-600"
        loading={loading}
      />
      <SummaryCard
        label="Cancelled"
        value={stats.cancelled}
        chip="Cancelled"
        chipClassName="border-red-200 bg-red-50 text-red-700"
        icon={XCircle}
        iconClassName="bg-red-50 text-red-600"
        loading={loading}
      />
      <SummaryCard
        label="Pending Payment"
        value={stats.pendingPayment}
        chip="Unpaid"
        chipClassName="border-orange-200 bg-orange-50 text-orange-700"
        icon={CreditCard}
        iconClassName="bg-orange-50 text-orange-600"
        loading={loading}
      />
    </div>
  );
}

export function DriverBookingFilters({
  search,
  statusFilter,
  paymentFilter,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onDateChange,
  onResetPage,
}: {
  search: string;
  statusFilter: DriverBookingStatusFilter;
  paymentFilter: DriverBookingPaymentFilter;
  dateFilter: DriverBookingDateFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DriverBookingStatusFilter) => void;
  onPaymentChange: (value: DriverBookingPaymentFilter) => void;
  onDateChange: (value: DriverBookingDateFilter) => void;
  onResetPage: () => void;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onResetPage();
            }}
            placeholder="Search by booking ID, location, slot, vehicle..."
            className="h-9 border-slate-200 bg-slate-50 pl-9 shadow-none"
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(value) => {
            onStatusChange(value);
            onResetPage();
          }}
          items={[
            ["ALL", "All Status"],
            ["PENDING", "Pending"],
            ["CONFIRMED", "Confirmed"],
            ["CANCELLED", "Cancelled"],
            ["COMPLETED", "Completed"],
          ]}
        />
        <FilterSelect
          value={paymentFilter}
          onChange={(value) => {
            onPaymentChange(value);
            onResetPage();
          }}
          items={[
            ["ALL", "All Payments"],
            ["PENDING", "Pending"],
            ["SUCCESS", "Paid"],
            ["FAILED", "Failed"],
          ]}
        />
        <FilterSelect
          value={dateFilter}
          onChange={(value) => {
            onDateChange(value);
            onResetPage();
          }}
          items={[
            ["ALL", "Date range"],
            ["TODAY", "Today"],
            ["UPCOMING", "Upcoming"],
            ["PAST", "Past"],
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function DriverBookingDetailPanel({
  booking,
  onPay,
  onCancel,
  onReceipt,
  onNavigate,
  onClose,
}: {
  booking: BookingResponse | null;
  onPay: (booking: BookingResponse) => Promise<void>;
  onCancel: (bookingId: string) => void;
  onReceipt: (booking: BookingResponse) => void;
  onNavigate: (booking: BookingResponse) => void | Promise<void>;
  onClose: () => void;
}) {
  if (!booking) {
    return (
      <Card className="rounded-lg border-dashed border-slate-200 bg-white shadow-none">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
          <ReceiptText className="size-9 text-slate-400" />
          <h2 className="mt-3 text-sm font-semibold text-slate-950">
            Select a booking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Booking details and actions will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canPay = canPayForDriverBooking(booking);
  const canCancel = canCancelDriverBooking(booking);
  const canShowReceipt = booking.paymentStatus === "SUCCESS";

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex flex-col p-0">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-950">
              {booking.parkingLocationName}
            </h2>
            <p className="mt-1 truncate font-mono text-xs text-slate-500">
              {booking.bookingId}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <BookingStatusBadge
                status={booking.status}
                slotStatus={booking.slotStatus}
              />
              <PaymentBadge status={booking.paymentStatus} />
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 text-slate-500 hover:text-slate-950"
            aria-label="Close booking details"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 p-4">
          <DetailSection title="Booking Details">
            <DetailGrid>
              <DetailItem label="Location" value={booking.parkingLocationName} />
              <DetailItem label="Slot" value={booking.slotNumber} badge />
              <DetailItem
                label="Vehicle Number"
                value={booking.vehicleNumber ?? "-"}
              />
              <DetailItem
                label="Vehicle Type"
                value={formatVehicleType(booking.vehicleType)}
              />
              <DetailItem label="Vendor" value={booking.driverName ?? "-"} />
              <DetailItem
                label="Source"
                value={booking.walkIn ? "Walk-in" : "App driver"}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Timing">
            <DetailGrid>
              <DetailItem
                label="Start"
                value={formatBookingDateTime(booking.startTime)}
              />
              <DetailItem
                label="End"
                value={formatBookingDateTime(booking.endTime)}
              />
              <DetailItem
                label="Duration"
                value={formatDriverBookingDuration(booking)}
              />
              <DetailItem
                label="Total Amount"
                value={formatBookingAmount(booking.totalAmount)}
                accent
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Payment">
            <DetailGrid>
              <DetailItem
                label="Payment Method"
                value={booking.paymentMethod ?? "-"}
              />
              <DetailItem
                label="Payment Status"
                value={driverBookingPaymentStatusLabel(booking.paymentStatus)}
              />
              <DetailItem label="Payment ID" value={booking.paymentId ?? "-"} />
              <DetailItem
                label="Paid At"
                value={
                  booking.paidAt ? formatBookingDateTime(booking.paidAt) : "-"
                }
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Refund">
            <DetailGrid>
              <DetailItem label="Refund Status" value="Not available" />
              <DetailItem label="Refund Eligible" value="Not available" />
            </DetailGrid>
          </DetailSection>
        </div>

        <div className="shrink-0 space-y-2 border-t bg-white p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => void onNavigate(booking)}
          >
            <MapPinned className="size-4" />
            Navigate to Parking
          </Button>
          {canPay ? (
            <Button
              type="button"
              className="w-full gap-2"
              onClick={() => void onPay(booking)}
            >
              <WalletCards className="size-4" />
              Pay / Retry Payment
            </Button>
          ) : null}
          {canShowReceipt ? (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => onReceipt(booking)}
            >
              <ReceiptText className="size-4" />
              View Receipt
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2 bg-red-100 text-red-700 hover:bg-red-200"
              onClick={() => onCancel(booking.bookingId)}
            >
              <CalendarX2 className="size-4" />
              Cancel Booking
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled
            >
              <CalendarX2 className="size-4" />
              Cancel Unavailable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SlotBadge({ slotNumber }: { slotNumber: string }) {
  return (
    <Badge
      variant="outline"
      className="border-blue-200 bg-blue-50 font-mono text-blue-700"
    >
      {slotNumber}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status?: string | null }) {
  const label = driverBookingPaymentStatusLabel(status);
  const className =
    status === "SUCCESS"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "FAILED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <Badge variant="outline" className={className}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  chip,
  chipClassName,
  icon: Icon,
  iconClassName,
  loading,
}: {
  label: string;
  value: number;
  chip: string;
  chipClassName: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  loading: boolean;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex min-h-[110px] flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md",
              iconClassName,
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
            <Badge variant="outline" className={cn("mt-1", chipClassName)}>
              <span className="size-1.5 rounded-full bg-current" />
              {chip}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilterSelect<TValue extends string>({
  value,
  onChange,
  items,
}: {
  value: TValue;
  onChange: (value: TValue) => void;
  items: Array<[TValue, string]>;
}) {
  return (
    <Select value={value} onValueChange={(nextValue) => onChange(nextValue as TValue)}>
      <SelectTrigger className="h-9 min-w-36 border-slate-200 bg-white shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
    <section className="border-b border-slate-200 pb-4 last:border-b-0">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function DetailItem({
  label,
  value,
  badge,
  accent,
}: {
  label: string;
  value: string;
  badge?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      {badge ? (
        <Badge
          variant="outline"
          className="mt-1 border-blue-200 bg-blue-50 font-mono text-blue-700"
        >
          {value}
        </Badge>
      ) : (
        <p
          className={cn(
            "mt-1 break-words text-sm font-semibold text-slate-950",
            accent && "text-blue-700",
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
}
