import { Bike, Car, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DataTableColumn } from "@/common";
import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";
import {
  formatAdminBookingCurrency,
  formatAdminBookingDate,
  formatAdminBookingStatusLabel,
  formatAdminBookingTimeRange,
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

export const adminBookingTableColumns: DataTableColumn<AdminBooking>[] = [
  {
    id: "bookingId",
    header: "Booking ID",
    className: "font-mono text-xs",
    cell: (booking) => (
      <span title={booking.bookingId}>
        {truncateAdminBookingId(booking.bookingId)}
      </span>
    ),
    compact: true,
  },
  {
    id: "driver",
    header: "Driver",
    cell: (booking) => (
      <div className="flex min-w-44 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">
              {getAdminBookingCustomerName(booking)}
            </p>
            {booking.walkIn ? (
              <Badge variant="outline" className="shrink-0">
                Walk-in
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {getAdminBookingCustomerPhone(booking)}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location / Slot",
    cell: (booking) => (
      <div className="min-w-44 space-y-1">
        <p className="truncate font-medium" title={booking.parkingLocationName}>
          {booking.parkingLocationName}
        </p>
        <Badge variant="secondary" className="font-mono">
          {booking.slotNumber}
        </Badge>
      </div>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: (booking) => {
      const VehicleIcon = booking.vehicleType === "TWO_WHEELER" ? Bike : Car;

      return (
        <div className="flex min-w-36 items-center gap-2">
          <VehicleIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {booking.vehicleNumber ?? "No vehicle number"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatAdminVehicleTypeLabel(booking.vehicleType)}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "timing",
    header: "Timing",
    cell: (booking) => (
      <div className="min-w-36">
        <p className="font-medium">
          {formatAdminBookingTimeRange(booking.startTime, booking.endTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatAdminBookingDate(booking.startTime)}
        </p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (booking) => {
      const status = getAdminBookingDisplayStatus(booking);

      return (
        <Badge variant={getAdminBookingStatusTone(status)}>
          {formatAdminBookingStatusLabel(status)}
        </Badge>
      );
    },
    compact: true,
  },
  {
    id: "payment",
    header: "Payment",
    cell: (booking) => {
      const status = getAdminBookingPaymentStatus(booking);

      return (
        <Badge variant={getAdminPaymentStatusTone(status)}>
          {formatAdminPaymentStatusLabel(status)}
        </Badge>
      );
    },
    compact: true,
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    cell: (booking) => formatAdminBookingCurrency(booking.totalAmount),
  },
];

export const adminBookingCompactTableColumns: DataTableColumn<AdminBooking>[] = [
  adminBookingTableColumns[0],
  adminBookingTableColumns[1],
  adminBookingTableColumns[2],
  adminBookingTableColumns[5],
  adminBookingTableColumns[7],
];
