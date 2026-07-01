import { X } from "lucide-react";
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
  getSlot,
  getSourceLabel,
} from "@/features/vendor/utils/vendor-booking.utils";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 wrap-break-word text-right font-medium">{value}</span>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative pl-6">
      <span className="absolute left-0 top-1.5 size-2.5 rounded-full bg-primary" />
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
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
    <aside className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">
            {getCustomerName(booking)}
          </h3>
          <p className="font-mono text-sm text-muted-foreground">
            {getBookingId(booking).slice(0, 8)}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Booking info
        </p>
        <DetailRow label="Status" value={status.label} />
        <DetailRow label="Location" value={booking.parkingLocationName ?? "-"} />
        <DetailRow label="Slot" value={getSlot(booking)} />
        <DetailRow
          label="Vehicle type"
          value={formatVehicleType(booking.vehicleType)}
        />
        <DetailRow label="Vehicle number" value={booking.vehicleNumber ?? "-"} />
        <DetailRow
          label="Check-in / start"
          value={formatDateTime(booking.startTime)}
        />
        <DetailRow
          label="Check-out / end"
          value={formatDateTime(booking.endTime)}
        />
        <DetailRow label="Amount" value={formatAmount(booking)} />
        <DetailRow label="Payment method" value={booking.paymentMethod ?? "-"} />
        <DetailRow label="Payment status" value={booking.paymentStatus ?? "-"} />
        <DetailRow label="Paid at" value={formatDateTime(booking.paidAt)} />
        <DetailRow label="Source" value={getSourceLabel(booking)} />

        <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Customer
        </p>
        <DetailRow label="Name" value={getCustomerName(booking)} />
        <DetailRow label="Phone" value={getCustomerPhone(booking)} />
        <DetailRow
          label="Driver email"
          value={
            booking.driverEmail ??
            booking.driver?.email ??
            booking.user?.email ??
            "-"
          }
        />

        <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline
        </p>
        <div className="space-y-4">
          <TimelineItem
            label="Reserved / created"
            value={formatDateTime(booking.createdAt ?? booking.startTime)}
          />
          {booking.paidAt && (
            <TimelineItem label="Paid" value={formatDateTime(booking.paidAt)} />
          )}
          {booking.slotStatus === "OCCUPIED" && (
            <TimelineItem
              label="Checked in"
              value={formatDateTime(booking.startTime)}
            />
          )}
          {booking.status === "COMPLETED" && (
            <TimelineItem
              label="Completed"
              value={formatDateTime(booking.endTime)}
            />
          )}
          {booking.cancelledAt && (
            <TimelineItem
              label="Cancelled"
              value={formatDateTime(booking.cancelledAt)}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t p-4">
        {canCheckIn(booking) && (
          <Button
            type="button"
            className="flex-1"
            disabled={isMutating}
            onClick={() => onAction(booking, "CHECK_IN")}
          >
            Check in
          </Button>
        )}
        {canComplete(booking) && (
          <Button
            type="button"
            className="flex-1"
            disabled={isMutating}
            onClick={() => onAction(booking, "COMPLETE")}
          >
            Mark complete
          </Button>
        )}
        {!canCheckIn(booking) && !canComplete(booking) && (
          <Button
            type="button"
            className="flex-1"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </aside>
  );
}
