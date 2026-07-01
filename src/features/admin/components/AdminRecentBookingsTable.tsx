import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/common/components/TableEmptyState";
import type { AdminRecentBooking } from "@/features/admin/types/admin.types";
import {
  formatAdminCurrency,
  formatAdminDate,
  formatAdminStatusLabel,
  formatAdminTimeRange,
  formatAdminVehicleType,
  getBookingStatusTone,
  truncateId,
} from "@/features/admin/utils/admin-dashboard.utils";

type AdminRecentBookingsTableProps = {
  bookings: AdminRecentBooking[];
};

export function AdminRecentBookingsTable({
  bookings,
}: AdminRecentBookingsTableProps) {
  return (
    <Card className="rounded-lg border shadow-none gap-0 place-self-start">
      <CardHeader className="gap-1 border-b">
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Latest platform bookings and slot activity.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {bookings.length === 0 ? (
          <TableEmptyState
            title="No recent bookings"
            description="New platform bookings will appear here."
            icon={<CalendarClock className="size-8 opacity-40" />}
            className="min-h-80"
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">
                    <span title={booking.id}>{truncateId(booking.id)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-36">
                      <p className="font-medium">{booking.driverName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.driverPhone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-44 truncate" title={booking.parkingName}>
                      {booking.parkingName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-medium">
                        {booking.slotCode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAdminVehicleType(booking.vehicleType)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-32">
                      <p className="text-sm">
                        {formatAdminTimeRange(
                          booking.startTime,
                          booking.endTime,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAdminDate(booking.bookingDate)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBookingStatusTone(booking.status)}>
                      {formatAdminStatusLabel(booking.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAdminCurrency(booking.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
