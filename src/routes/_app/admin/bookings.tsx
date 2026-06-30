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
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
    case "COMPLETED":
      return "default";
    case "PENDING":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
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
    header: "Driver name",
    cell: formatDriverName,
  },
  {
    key: "location",
    header: "Parking location name",
    cell: (booking) => booking.parkingLocationName,
  },
  {
    key: "startTime",
    header: "Start time",
    cell: (booking) => formatDateTime(booking.startTime),
  },
  {
    key: "status",
    header: "Status",
    cell: (booking) => (
      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    cell: (booking) => `Rs. ${Number(booking.totalAmount).toFixed(2)}`,
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
