import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import DataTable, { type ColumnDef } from "@/common/components/DataTable";
import { PageHeader } from "@/common/components/PageHeader";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { queryKeys } from "@/config/query-keys";
import { getAdminBookings } from "@/features/bookings/services/admin-bookings.service";
import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";

export const Route = createFileRoute("/_app/admin/bookings")({
  component: AdminBookingsPage,
});

function getStatusVariant(
  status: string,
  slotStatus?: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (slotStatus === "BOOKED" || slotStatus === "OCCUPIED") {
    return "secondary";
  }

  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "default";
    case "PENDING":
    case "CONFIRMED":
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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDriverName(booking: AdminBooking): string {
  if (booking.driverName) return booking.driverName;
  if (booking.customerName) return booking.customerName;
  return booking.walkIn ? "Walk-in customer" : "Driver booking";
}

const columns: ColumnDef<AdminBooking>[] = [
  {
    key: "bookingId",
    header: "ID",
    className: "font-mono",
    cell: (booking) => `${booking.bookingId.slice(0, 8)}…`,
  },
  {
    key: "driver",
    header: "Driver",
    cell: (booking) => (
      <div>
        <p className="font-medium">{formatDriverName(booking)}</p>
        <p className="text-xs text-muted-foreground">
          {booking.customerPhone ?? booking.vehicleNumber ?? "No phone"}
        </p>
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    cell: (booking) => (
      <span className="rounded-md border bg-muted/30 px-2 py-1 text-sm">
        {booking.parkingLocationName}
      </span>
    ),
  },
  {
    key: "slot",
    header: "Slot",
    cell: (booking) => (
      <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary">
        {booking.slotNumber}
      </span>
    ),
  },
  {
    key: "startTime",
    header: "Time",
    cell: (booking) => (
      <div>
        <p className="font-medium">
          {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(booking.startTime)}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (booking) => (
      <Badge variant={getStatusVariant(booking.status, booking.slotStatus)}>
        {formatStatus(booking.status, booking.slotStatus)}
      </Badge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    cell: (booking) => `Rs. ${Number(booking.totalAmount).toFixed(2)}`,
  },
  {
    key: "action",
    header: "Action",
    cell: () => <span className="text-muted-foreground">-</span>,
  },
];

function AdminBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomQuery({
    key: queryKeys.admin.bookings({ search, page }),
    queryFn: () => getAdminBookings({ search, page }),
    options: {
      enabled: isAuthorized,
    },
  });

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <PageHeader title="Bookings" />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No bookings found"
      />
    </>
  );
}
