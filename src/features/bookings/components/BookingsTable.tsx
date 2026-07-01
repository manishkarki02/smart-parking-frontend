import { useState } from "react";
import { SplitDataTable, SplitDetailPanel, type DataTableColumn } from "@/common";
import type { AdminBooking } from "../types/admin-booking.types";
import { Badge } from "@/components/ui/badge";

interface BookingsTableProps {
  bookings: AdminBooking[];
}

function getStatusVariant(
  status: string,
  slotStatus?: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (slotStatus === "BOOKED" || slotStatus === "OCCUPIED") {
    return "secondary";
  }

  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "CONFIRMED":
      return "default";
    case "PENDING":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatStatus(status: string, slotStatus?: string): string {
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (slotStatus === "RESERVED") return "Reserved";
  if (slotStatus === "BOOKED") return "Booked";
  if (slotStatus === "OCCUPIED") return "Occupied";
  return status;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDriverName(booking: AdminBooking): string {
  if (booking.driverName) return booking.driverName;
  if (booking.customerName) return booking.customerName;
  return booking.walkIn ? "Walk-in customer" : "Driver booking";
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
          <p className="text-sm font-medium">{formatDriverName(booking)}</p>
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
      cell: (booking) => formatDateTime(booking.startTime),
    },
    {
      id: "end",
      header: "End",
      className: "text-sm",
      cell: (booking) => formatDateTime(booking.endTime),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (booking) => `Rs. ${Number(booking.totalAmount).toFixed(2)}`,
    },
    {
      id: "status",
      header: "Status",
      cell: (booking) => (
        <Badge variant={getStatusVariant(booking.status, booking.slotStatus)}>
          {formatStatus(booking.status, booking.slotStatus)}
        </Badge>
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
      detailTitle={selectedBooking ? formatDriverName(selectedBooking) : "Booking details"}
      detailPanel={
        selectedBooking ? (
          <SplitDetailPanel
            title={formatDriverName(selectedBooking)}
            subtitle={selectedBooking.bookingId}
            onClose={() => setSelectedBookingId(null)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Location" value={selectedBooking.parkingLocationName} />
              <InfoItem label="Slot" value={selectedBooking.slotNumber} />
              <InfoItem label="Start" value={formatDateTime(selectedBooking.startTime)} />
              <InfoItem label="End" value={formatDateTime(selectedBooking.endTime)} />
              <InfoItem label="Amount" value={`Rs. ${Number(selectedBooking.totalAmount).toFixed(2)}`} />
              <InfoItem
                label="Status"
                value={
                  <Badge variant={getStatusVariant(selectedBooking.status, selectedBooking.slotStatus)}>
                    {formatStatus(selectedBooking.status, selectedBooking.slotStatus)}
                  </Badge>
                }
              />
            </div>
          </SplitDetailPanel>
        ) : null
      }
    />
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium">{value}</div>
    </div>
  );
}
