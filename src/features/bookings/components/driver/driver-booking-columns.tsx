import type { DataTableColumn } from "@/common";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingTime,
  formatVehicleType,
} from "@/features/bookings/utils/booking-formatters";
import { shortDriverBookingId } from "@/features/bookings/utils/driver-booking-page.utils";
import {
  PaymentBadge,
  SlotBadge,
} from "@/features/bookings/components/driver/DriverBookingPageSections";

export function buildDriverBookingColumns(): DataTableColumn<BookingResponse>[] {
  return [
    {
      id: "bookingId",
      header: "Booking ID",
      cell: (booking) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {shortDriverBookingId(booking.bookingId)}
        </span>
      ),
    },
    {
      id: "location",
      header: "Parking",
      cell: (booking) => (
        <span className="block max-w-40 truncate text-sm font-semibold text-slate-950">
          {booking.parkingLocationName}
        </span>
      ),
    },
    {
      id: "slot",
      header: "Slot",
      cell: (booking) => <SlotBadge slotNumber={booking.slotNumber} />,
      compact: true,
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (booking) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-950">
            {booking.vehicleNumber ?? "-"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {formatVehicleType(booking.vehicleType)}
          </p>
        </div>
      ),
    },
    {
      id: "timing",
      header: "Timing",
      cell: (booking) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-950">
            {formatBookingTime(booking.startTime)} -{" "}
            {formatBookingTime(booking.endTime)}
          </p>
          <p className="text-xs text-slate-500">
            {formatBookingDate(booking.startTime)}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (booking) => (
        <BookingStatusBadge
          status={booking.status}
          slotStatus={booking.slotStatus}
        />
      ),
    },
    {
      id: "payment",
      header: "Payment",
      cell: (booking) => <PaymentBadge status={booking.paymentStatus} />,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (booking) => (
        <span className="text-xs font-bold text-slate-950">
          {formatBookingAmount(booking.totalAmount)}
        </span>
      ),
    },
  ];
}
