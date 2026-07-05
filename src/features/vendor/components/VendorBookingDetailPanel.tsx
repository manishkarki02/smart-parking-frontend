import {
  CheckCircle2,
  LogIn,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VendorBooking } from "@/features/bookings/services/booking.service";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import {
  canCheckIn,
  canComplete,
  formatAmount,
  formatDateTime,
  formatVehicleType,
  getBookingId,
  getCustomerName,
  getCustomerPhone,
  getOperationalStatus,
  getPaymentStatusVariant,
  getSlot,
  getSourceLabel,
} from "@/features/vendor/utils/vendor-booking.utils";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </p>
  );
}

function DetailRow({
  label,
  value,
  badge,
}: {
  label: string;
  value?: string | number | null;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2.5 text-sm last:border-b-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right font-semibold text-slate-950">
        {badge ?? value ?? "-"}
      </span>
    </div>
  );
}

function TimelineItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "blue" | "slate";
}) {
  return (
    <div className="relative pl-6">
      <span
        className={cn(
          "absolute left-0 top-1.5 size-2.5 rounded-full",
          tone === "green" && "bg-green-500",
          tone === "blue" && "bg-blue-500",
          tone === "slate" && "bg-slate-300",
        )}
      />
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{value}</p>
    </div>
  );
}

export function VendorBookingDetailPanel({
  booking,
  isMutating,
  onClose,
  onAction,
}: {
  booking: VendorBooking;
  isMutating: boolean;
  onClose: () => void;
  onAction: (booking: VendorBooking, action: VendorBookingAction) => void;
}) {
  const status = getOperationalStatus(booking);

  return (
    <aside className="flex min-h-[640px] min-w-0 flex-col border-l border-slate-200 bg-white xl:h-full">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-950">
            {getCustomerName(booking)}
          </h3>
          <p className="font-mono text-xs text-slate-500">
            #{getBookingId(booking).slice(0, 8)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 border-slate-200"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        <PaymentStatusBadge status={booking.paymentStatus} />
        <SourceBadge booking={booking} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="space-y-3 border-b border-slate-200 p-4">
          <SectionTitle>Customer</SectionTitle>
          <div className="flex items-center gap-3 rounded-md bg-slate-100 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
              <UserRound className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {getCustomerName(booking)}
              </p>
              <p className="truncate font-mono text-xs text-slate-500">
                +977 {getCustomerPhone(booking)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-b border-slate-200 p-4">
          <SectionTitle>Booking info</SectionTitle>
          <div>
            <DetailRow label="Location" value={booking.parkingLocationName} />
            <DetailRow
              label="Slot"
              badge={<SlotBadge booking={booking} />}
            />
            <DetailRow
              label="Vehicle type"
              value={formatVehicleType(booking.vehicleType)}
            />
            <DetailRow label="Vehicle no." value={booking.vehicleNumber} />
          </div>
        </section>

        <section className="space-y-4 border-b border-slate-200 p-4">
          <SectionTitle>Timeline</SectionTitle>
          <TimelineItem
            label="Check-in / Start"
            value={formatDateTime(booking.startTime)}
            tone="green"
          />
          <TimelineItem
            label="Expected End"
            value={formatDateTime(booking.endTime)}
            tone="blue"
          />
          <TimelineItem
            label="Completed"
            value={
              booking.status === "COMPLETED"
                ? formatDateTime(booking.endTime)
                : "-"
            }
            tone={booking.status === "COMPLETED" ? "green" : "slate"}
          />
        </section>

        <section className="space-y-3 p-4">
          <SectionTitle>Payment</SectionTitle>
          <div>
            <DetailRow label="Amount" value={formatAmount(booking)} />
            <DetailRow
              label="Method"
              badge={<PaymentMethodBadge method={booking.paymentMethod} />}
            />
            <DetailRow
              label="Status"
              badge={<PaymentStatusBadge status={booking.paymentStatus} />}
            />
            <DetailRow
              label="Transaction ID"
              value={booking.paymentId ? `TXN-${booking.paymentId}` : "-"}
            />
          </div>
        </section>
      </div>

      <div className="space-y-2 border-t border-slate-200 bg-slate-50 p-4">
        {canCheckIn(booking) ? (
          <Button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isMutating}
            onClick={() => onAction(booking, "CHECK_IN")}
          >
            <LogIn className="size-4" />
            Check In Vehicle
          </Button>
        ) : null}
        {canComplete(booking) ? (
          <Button
            type="button"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isMutating}
            onClick={() => onAction(booking, "COMPLETE")}
          >
            <CheckCircle2 className="size-4" />
            Mark Complete
          </Button>
        ) : null}
        <Button
          type="button"
          className="w-full"
          variant="outline"
          disabled
        >
          <XCircle className="size-4" />
          Cancel Unavailable
        </Button>
      </div>
    </aside>
  );
}

function SourceBadge({ booking }: { booking: VendorBooking }) {
  const isWalkIn = booking.walkIn;
  return (
    <Badge
      className={cn(
        "border-0 px-2.5 py-1 text-xs font-bold shadow-none",
        isWalkIn
          ? "bg-purple-50 text-purple-700 hover:bg-purple-50"
          : "bg-blue-50 text-blue-700 hover:bg-blue-50",
      )}
    >
      {getSourceLabel(booking)}
    </Badge>
  );
}

function SlotBadge({ booking }: { booking: VendorBooking }) {
  const isFourWheeler = booking.vehicleType === "FOUR_WHEELER";
  return (
    <Badge
      className={cn(
        "border-0 px-2.5 py-1 font-mono text-xs font-bold shadow-none",
        isFourWheeler
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          : "bg-blue-100 text-blue-700 hover:bg-blue-100",
      )}
    >
      {getSlot(booking)}
    </Badge>
  );
}

function PaymentMethodBadge({ method }: { method?: string | null }) {
  const normalized = method?.toUpperCase();
  return (
    <Badge
      className={cn(
        "border px-2.5 py-0.5 text-xs font-bold shadow-none",
        normalized === "CASH"
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
          : "border-purple-200 bg-purple-700 text-white hover:bg-purple-700",
      )}
    >
      {normalized ?? "-"}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status?: string | null }) {
  const label =
    status?.toUpperCase() === "SUCCESS"
      ? "Paid"
      : status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "-";
  return (
    <Badge className="w-fit" variant={getPaymentStatusVariant(status)}>
      {label}
    </Badge>
  );
}
