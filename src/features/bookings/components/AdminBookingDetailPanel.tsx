import { CreditCard, MapPin, Timer, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InfoItem } from "@/common/components/detail-panel/InfoItem";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
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
        <Empty className="min-h-[420px] border-0">
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
      <div className="space-y-4">
        <section className="rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getAdminBookingStatusTone(bookingStatus)}>
              {formatAdminBookingStatusLabel(bookingStatus)}
            </Badge>
            <Badge variant={getAdminPaymentStatusTone(paymentStatus)}>
              {formatAdminPaymentStatusLabel(paymentStatus)}
            </Badge>
            <Badge variant="outline">{booking.walkIn ? "Walk-in" : "Online"}</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Total amount"
              value={formatAdminBookingCurrency(booking.totalAmount)}
            />
            <InfoItem label="Booking ID" value={booking.bookingId} />
          </div>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <SectionTitle icon={UserRound} title="Driver / Customer" />
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              label={booking.walkIn ? "Customer" : "Driver"}
              value={getAdminBookingCustomerName(booking)}
            />
            <InfoItem
              label="Phone"
              value={getAdminBookingCustomerPhone(booking)}
            />
            <InfoItem
              label="Vehicle number"
              value={booking.vehicleNumber ?? "No vehicle number"}
            />
            <InfoItem
              label="Vehicle type"
              value={formatAdminVehicleTypeLabel(booking.vehicleType)}
            />
            <InfoItem label="Driver ID" value={booking.driverId ?? "N/A"} />
            <InfoItem label="Email" value="No email" />
          </div>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <SectionTitle icon={MapPin} title="Parking Location" />
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="Location" value={booking.parkingLocationName} />
            <InfoItem label="Location ID" value={booking.parkingLocationId} />
            <InfoItem label="Slot" value={booking.slotNumber} />
            <InfoItem label="Slot ID" value={booking.slotId} />
            <InfoItem label="Vendor" value="N/A" />
          </div>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <SectionTitle icon={Timer} title="Timeline" />
          <div className="space-y-3 text-sm">
            <TimelineRow
              label="Booking start"
              value={formatAdminBookingDateTime(booking.startTime)}
            />
            <TimelineRow
              label="Expected end"
              value={formatAdminBookingDateTime(booking.endTime)}
            />
            <TimelineRow
              label="Cancelled"
              value={formatAdminBookingDateTime(booking.cancelledAt)}
            />
            <TimelineRow
              label="Duration"
              value={formatAdminBookingDuration(
                booking.startTime,
                booking.endTime,
              )}
            />
          </div>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <SectionTitle icon={CreditCard} title="Payment" />
          {booking.paymentId || booking.paymentStatus || booking.paymentMethod ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Payment ID" value={booking.paymentId ?? "N/A"} />
              <InfoItem
                label="Method"
                value={formatAdminPaymentMethodLabel(booking.paymentMethod)}
              />
              <InfoItem
                label="Status"
                value={
                  <Badge variant={getAdminPaymentStatusTone(paymentStatus)}>
                    {formatAdminPaymentStatusLabel(paymentStatus)}
                  </Badge>
                }
              />
              <InfoItem
                label="Paid at"
                value={formatAdminBookingDateTime(booking.paidAt)}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              No payment record
            </div>
          )}
        </section>

        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Admin Actions</h3>
              <p className="text-xs text-muted-foreground">
                No supported booking actions are available for this record.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <X aria-hidden="true" />
              Close
            </Button>
          </div>
        </section>
      </div>
    </SplitDetailPanel>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof UserRound;
  title: string;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-medium">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      {title}
    </h3>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
