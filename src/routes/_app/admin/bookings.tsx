import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  DataTablePagination,
  SplitDataTable,
  SplitDetailPanel,
  TableToolbar,
  type DataTableColumn,
} from "@/common";
import { PageHeader } from "@/common/components/PageHeader";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
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
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatTime(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return `${formatDate(value)} ${formatTime(value)}`;
}

function formatVehicleType(vehicleType?: string): string {
  if (vehicleType === "TWO_WHEELER") return "Two wheeler";
  if (vehicleType === "FOUR_WHEELER") return "Four wheeler";
  return "-";
}

function formatAmount(value?: number | null): string {
  return `Rs. ${Number(value ?? 0).toFixed(2)}`;
}

function formatDriverName(booking: AdminBooking): string {
  if (booking.driverName) return booking.driverName;
  if (booking.customerName) return booking.customerName;
  return booking.walkIn ? "Walk-in customer" : "Driver booking";
}

function BookingStatusBadge({ booking }: { booking: AdminBooking }) {
  return (
    <Badge variant={getStatusVariant(booking.status, booking.slotStatus)}>
      {formatStatus(booking.status, booking.slotStatus)}
    </Badge>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

function AdminBookingDetailPanel({
  booking,
  onClose,
}: {
  booking: AdminBooking;
  onClose: () => void;
}) {
  return (
    <SplitDetailPanel
      title={formatDriverName(booking)}
      subtitle={booking.bookingId}
      onClose={onClose}
    >
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Parking" value={booking.parkingLocationName} />
          <InfoItem label="Slot" value={booking.slotNumber} />
          <InfoItem
            label="Vehicle type"
            value={formatVehicleType(booking.vehicleType)}
          />
          <InfoItem label="Vehicle number" value={booking.vehicleNumber ?? "-"} />
          <InfoItem label="Amount" value={formatAmount(booking.totalAmount)} />
          <InfoItem
            label="Source"
            value={booking.walkIn ? "Walk-in" : "Driver app"}
          />
        </section>

        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <BookingStatusBadge booking={booking} />
            {booking.paymentStatus ? (
              <Badge variant="outline">{booking.paymentStatus}</Badge>
            ) : null}
            {booking.slotStatus ? (
              <Badge variant="secondary">{booking.slotStatus}</Badge>
            ) : null}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Customer" value={formatDriverName(booking)} />
          <InfoItem label="Phone" value={booking.customerPhone ?? "-"} />
          <InfoItem label="Driver ID" value={booking.driverId ?? "-"} />
          <InfoItem label="Payment method" value={booking.paymentMethod ?? "-"} />
          <InfoItem label="Payment ID" value={booking.paymentId ?? "-"} />
          <InfoItem label="Paid at" value={formatDateTime(booking.paidAt)} />
        </section>

        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">Timeline</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Start</span>
              <span className="text-right font-medium">
                {formatDateTime(booking.startTime)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">End</span>
              <span className="text-right font-medium">
                {formatDateTime(booking.endTime)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Cancelled</span>
              <span className="text-right font-medium">
                {formatDateTime(booking.cancelledAt)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </SplitDetailPanel>
  );
}

const columns: DataTableColumn<AdminBooking>[] = [
  {
    id: "bookingId",
    header: "ID",
    className: "font-mono",
    cell: (booking) => `${booking.bookingId.slice(0, 8)}…`,
    compact: true,
  },
  {
    id: "driver",
    header: "Driver",
    cell: (booking) => (
      <div>
        <p className="font-medium">{formatDriverName(booking)}</p>
        <p className="text-xs text-muted-foreground">
          {booking.customerPhone ?? booking.vehicleNumber ?? "No phone"}
        </p>
      </div>
    ),
    compact: true,
  },
  {
    id: "location",
    header: "Location",
    cell: (booking) => (
      <span className="rounded-md border bg-muted/30 px-2 py-1 text-sm">
        {booking.parkingLocationName}
      </span>
    ),
  },
  {
    id: "slot",
    header: "Slot",
    cell: (booking) => (
      <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary">
        {booking.slotNumber}
      </span>
    ),
  },
  {
    id: "startTime",
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
    id: "status",
    header: "Status",
    cell: (booking) => <BookingStatusBadge booking={booking} />,
    compact: true,
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    cell: (booking) => formatAmount(booking.totalAmount),
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <span data-row-action="true" className="text-muted-foreground">
        -
      </span>
    ),
  },
];

function AdminBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useCustomQuery({
    key: queryKeys.admin.bookings({ search, page }),
    queryFn: () => getAdminBookings({ search, page }),
    options: {
      enabled: isAuthorized,
    },
  });

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);
  const selectedBooking = useMemo(
    () =>
      bookings.find((booking) => booking.bookingId === selectedBookingId) ??
      null,
    [bookings, selectedBookingId],
  );

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <PageHeader title="Bookings" />
      <SplitDataTable
        columns={columns}
        rows={bookings}
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
            <AdminBookingDetailPanel
              booking={selectedBooking}
              onClose={() => setSelectedBookingId(null)}
            />
          ) : null
        }
        isLoading={isLoading}
        error={isError}
        emptyState={
          <Empty className="border-0 py-10">
            <EmptyDescription>No bookings found.</EmptyDescription>
          </Empty>
        }
        toolbar={
          <TableToolbar
            left={
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                    setSelectedBookingId(null);
                  }}
                  placeholder="Search bookings..."
                  className="pl-9"
                />
              </div>
            }
          />
        }
        pagination={
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 1}
            pageSizeOptions={[10]}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        }
      />
    </>
  );
}
