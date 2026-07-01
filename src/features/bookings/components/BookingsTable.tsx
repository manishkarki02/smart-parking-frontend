import { useState } from "react";
import {
  InfoItem,
  SplitDataTable,
  SplitDetailPanel,
  type DataTableColumn,
} from "@/common";
import type { AdminBooking } from "../types/admin-booking.types";
import { BookingStatusBadge } from "./BookingStatusBadge";
import {
  formatBookingAmount,
  formatBookingCustomerName,
  formatBookingDateTimeLong,
} from "../utils/booking-formatters";

interface BookingsTableProps {
  bookings: AdminBooking[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const selectedBooking =
    bookings.find((booking) => booking.bookingId === selectedBookingId) ?? null;

  const columns: DataTableColumn<AdminBooking>[] = [
    {
      id: "id",
      header: "ID",
      className: "font-medium",
      cell: (booking) => `${booking.bookingId.slice(0, 8)}…`,
      compact: true,
    },
    {
      id: "user",
      header: "User",
      cell: (booking) => (
        <div>
          <p className="text-sm font-medium">
            {formatBookingCustomerName(booking)}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.vehicleNumber ?? booking.slotNumber}
          </p>
        </div>
      ),
      compact: true,
    },
    {
      id: "location",
      header: "Location",
      cell: (booking) => booking.parkingLocationName,
    },
    {
      id: "start",
      header: "Start",
      className: "text-sm",
      cell: (booking) => formatBookingDateTimeLong(booking.startTime),
    },
    {
      id: "end",
      header: "End",
      className: "text-sm",
      cell: (booking) => formatBookingDateTimeLong(booking.endTime),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (booking) => formatBookingAmount(booking.totalAmount),
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
      compact: true,
    },
  ];

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bookings found
      </div>
    );
  }

  return (
    <SplitDataTable
      rows={bookings}
      columns={columns}
      getRowId={(booking) => booking.bookingId}
      selectedRowId={selectedBookingId}
      onRowSelect={(booking) =>
        setSelectedBookingId((current) =>
          current === booking.bookingId ? null : booking.bookingId,
        )
      }
      onDetailClose={() => setSelectedBookingId(null)}
      detailTitle={
        selectedBooking
          ? formatBookingCustomerName(selectedBooking)
          : "Booking details"
      }
      detailPanel={
        selectedBooking ? (
          <SplitDetailPanel
            title={formatBookingCustomerName(selectedBooking)}
            subtitle={selectedBooking.bookingId}
            onClose={() => setSelectedBookingId(null)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Location" value={selectedBooking.parkingLocationName} />
              <InfoItem label="Slot" value={selectedBooking.slotNumber} />
              <InfoItem
                label="Start"
                value={formatBookingDateTimeLong(selectedBooking.startTime)}
              />
              <InfoItem
                label="End"
                value={formatBookingDateTimeLong(selectedBooking.endTime)}
              />
              <InfoItem
                label="Amount"
                value={formatBookingAmount(selectedBooking.totalAmount)}
              />
              <InfoItem
                label="Status"
                value={
                  <BookingStatusBadge
                    status={selectedBooking.status}
                    slotStatus={selectedBooking.slotStatus}
                  />
                }
              />
            </div>
          </SplitDetailPanel>
        ) : null
      }
    />
  );
}
