import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  DataTablePagination,
  InfoItem,
  SplitDataTable,
  SplitDetailPanel,
  TableEmptyState,
  TableToolbar,
  type DataTableColumn,
} from "@/common";
import { PageHeader } from "@/common/components/PageHeader";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/config/query-keys";
import { getAdminBookings } from "@/features/bookings/services/admin-bookings.service";
import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import {
  formatBookingAmount,
  formatBookingCustomerName,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingTime,
  formatVehicleType,
} from "@/features/bookings/utils/booking-formatters";

function AdminBookingStatusBadge({ booking }: { booking: AdminBooking }) {
  return (
    <BookingStatusBadge
      status={booking.status}
      slotStatus={booking.slotStatus}
    />
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
      title={formatBookingCustomerName(booking)}
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
          <InfoItem label="Amount" value={formatBookingAmount(booking.totalAmount)} />
          <InfoItem
            label="Source"
            value={booking.walkIn ? "Walk-in" : "Driver app"}
          />
        </section>

        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <AdminBookingStatusBadge booking={booking} />
            {booking.paymentStatus ? (
              <Badge variant="outline">{booking.paymentStatus}</Badge>
            ) : null}
            {booking.slotStatus ? (
              <Badge variant="secondary">{booking.slotStatus}</Badge>
            ) : null}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Customer" value={formatBookingCustomerName(booking)} />
          <InfoItem label="Phone" value={booking.customerPhone ?? "-"} />
          <InfoItem label="Driver ID" value={booking.driverId ?? "-"} />
          <InfoItem label="Payment method" value={booking.paymentMethod ?? "-"} />
          <InfoItem label="Payment ID" value={booking.paymentId ?? "-"} />
          <InfoItem label="Paid at" value={formatBookingDateTime(booking.paidAt)} />
        </section>

        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">Timeline</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Start</span>
              <span className="text-right font-medium">
                {formatBookingDateTime(booking.startTime)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">End</span>
              <span className="text-right font-medium">
                {formatBookingDateTime(booking.endTime)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Cancelled</span>
              <span className="text-right font-medium">
                {formatBookingDateTime(booking.cancelledAt)}
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
        <p className="font-medium">{formatBookingCustomerName(booking)}</p>
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
          {formatBookingTime(booking.startTime)}-
          {formatBookingTime(booking.endTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBookingDate(booking.startTime)}
        </p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (booking) => <AdminBookingStatusBadge booking={booking} />,
    compact: true,
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    cell: (booking) => formatBookingAmount(booking.totalAmount),
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

export function AdminBookingsPage() {
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
        detailTitle={
          selectedBooking
            ? formatBookingCustomerName(selectedBooking)
            : "Booking details"
        }
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
          <TableEmptyState
            title="No bookings found"
            description="Try adjusting your search to find a booking."
          />
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
