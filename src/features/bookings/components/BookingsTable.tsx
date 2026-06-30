import type { AdminBooking } from "../types/admin-booking.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface BookingsTableProps {
  bookings: AdminBooking[];
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
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
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bookings found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.bookingId}>
              <TableCell className="font-medium">
                {booking.bookingId.slice(0, 8)}…
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium">
                    {formatDriverName(booking)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.vehicleNumber ?? booking.slotNumber}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {booking.parkingLocationName}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(booking.startTime)}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(booking.endTime)}
              </TableCell>
              <TableCell>Rs. {Number(booking.totalAmount).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
