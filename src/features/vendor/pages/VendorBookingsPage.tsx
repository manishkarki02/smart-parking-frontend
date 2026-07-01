import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  DataTablePagination,
  SplitDataTable,
  TableToolbar,
  TableEmptyState,
  type DataTableColumn,
} from "@/common";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/config/query-keys";
import { getVendorBookings, type VendorBooking } from "@/features/bookings/services/booking.service";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { VendorBookingDetailPanel } from "@/features/vendor/components/VendorBookingDetailPanel";
import { VendorBookingStatusBadge } from "@/features/vendor/components/VendorBookingStatusBadge";
import { VendorBookingSummaryCards } from "@/features/vendor/components/VendorBookingSummaryCards";
import { VendorBookingsPageHeader } from "@/features/vendor/components/VendorBookingsPageHeader";
import {
  getMyParkingLocations,
  updateVendorBookingStatus,
} from "@/features/vendor/services/vendor.service";
import type {
  VendorBookingStatusFilter,
  VendorBookingSummary,
} from "@/features/vendor/types/vendor-booking.types";
import {
  canCheckIn,
  canComplete,
  formatAmount,
  formatDate,
  formatTime,
  getBookingId,
  getCustomerName,
  getCustomerPhone,
  getOperationalStatus,
  getPaymentStatusVariant,
  getSlot,
  getSourceLabel,
  matchesStatusFilter,
  VENDOR_BOOKINGS_PAGE_SIZE,
} from "@/features/vendor/utils/vendor-booking.utils";

export function VendorBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<VendorBookingStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const vendorLocationId = locationId === "ALL" ? undefined : locationId;

  const { data: locations = [] } = useCustomQuery({
    key: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
    options: { enabled: isAuthorized },
  });

  const { data, isLoading, isError } = useCustomQuery({
    key: queryKeys.bookings.vendor({
      search,
      page,
      locationId: vendorLocationId,
      status: statusFilter,
    }),
    queryFn: () => getVendorBookings({ locationId: vendorLocationId }),
    options: { enabled: isAuthorized },
  });

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const haystack = [
        getBookingId(booking),
        getCustomerName(booking),
        getCustomerPhone(booking),
        booking.parkingLocationName,
        getSlot(booking),
        booking.vehicleNumber ?? "",
        booking.paymentMethod ?? "",
        booking.paymentStatus ?? "",
        getSourceLabel(booking),
        getOperationalStatus(booking).label,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        matchesStatusFilter(booking, statusFilter)
      );
    });
  }, [bookings, search, statusFilter]);

  const pagedBookings = filteredBookings.slice(
    (page - 1) * VENDOR_BOOKINGS_PAGE_SIZE,
    page * VENDOR_BOOKINGS_PAGE_SIZE,
  );
  const selectedBooking =
    filteredBookings.find((booking) => getBookingId(booking) === selectedBookingId) ?? null;

  const summary = useMemo<VendorBookingSummary>(() => {
    const today = new Date().toDateString();
    const completedToday = filteredBookings.filter(
      (booking) =>
        booking.status === "COMPLETED" &&
        booking.endTime &&
        new Date(booking.endTime).toDateString() === today,
    ).length;
    const completedTotal = filteredBookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const revenue = filteredBookings
      .filter(
        (booking) =>
          booking.paymentStatus === "SUCCESS" || booking.status === "COMPLETED",
      )
      .reduce((total, booking) => total + Number(booking.totalAmount ?? booking.amount ?? 0), 0);

    return {
      total: filteredBookings.length,
      active: filteredBookings.filter(
        (booking) =>
          booking.slotStatus === "RESERVED" ||
          booking.slotStatus === "BOOKED" ||
          booking.slotStatus === "OCCUPIED",
      ).length,
      completed: completedToday || completedTotal,
      revenue,
      completedHelper: completedToday ? "Today" : "Current filter",
    };
  }, [filteredBookings]);

  const statusMutation = useCustomMutation({
    api: updateVendorBookingStatus,
    onSuccess: (updatedBooking) => {
      toast.success("Booking updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.vendor() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(updatedBooking.parkingLocationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.detail(updatedBooking.parkingLocationId),
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
        return;
      }
      toast.error(message || "Booking update failed");
      if (selectedBooking?.parkingLocationId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.parking.vendorSlots(selectedBooking.parkingLocationId),
        });
      }
    },
  });

  function runAction(booking: VendorBooking, action: VendorBookingAction) {
    statusMutation.mutate({
      bookingId: getBookingId(booking),
      data: { action },
    });
  }

  function selectBooking(booking: VendorBooking) {
    setSelectedBookingId((current) =>
      current === getBookingId(booking) ? null : getBookingId(booking),
    );
  }

  function selectLocation(nextLocationId: string) {
    setLocationId(nextLocationId);
    setPage(1);
    setSelectedBookingId(null);
  }

  const columns: DataTableColumn<VendorBooking>[] = [
    {
      id: "booking",
      header: "ID",
      className: "font-mono text-sm",
      compact: true,
      cell: (booking) => getBookingId(booking).slice(0, 8),
    },
    {
      id: "customer",
      header: "Customer",
      compact: true,
      cell: (booking) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{getCustomerName(booking)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {getCustomerPhone(booking)}
          </p>
        </div>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: (booking) => (
        <Badge variant="outline">{getSourceLabel(booking)}</Badge>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (booking) => (
        <span className="rounded-md border bg-muted/30 px-2 py-1 text-sm">
          {booking.parkingLocationName ?? "-"}
        </span>
      ),
    },
    {
      id: "slot",
      header: "Slot",
      cell: (booking) => (
        <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary">
          {getSlot(booking)}
        </span>
      ),
    },
    {
      id: "time",
      header: "Time",
      cell: (booking) => (
        <div className="min-w-32.5">
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
      id: "amount",
      header: "Amount",
      className: "font-semibold",
      cell: (booking) => formatAmount(booking),
    },
    {
      id: "payment",
      header: "Payment",
      cell: (booking) => (
        <div className="flex min-w-30 flex-col gap-1">
          <span>{booking.paymentMethod ?? "-"}</span>
          <Badge
            className="w-fit"
            variant={getPaymentStatusVariant(booking.paymentStatus)}
          >
            {booking.paymentStatus ?? "-"}
          </Badge>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      compact: true,
      cell: (booking) => <VendorBookingStatusBadge booking={booking} />,
    },
    {
      id: "action",
      header: "Action",
      compact: true,
      cell: (booking) => (
        <div data-row-action="true">
          {canCheckIn(booking) && (
            <Button
              type="button"
              size="sm"
              disabled={statusMutation.isPending}
              onClick={() => runAction(booking, "CHECK_IN")}
            >
              Check in
            </Button>
          )}
          {canComplete(booking) && (
            <Button
              type="button"
              size="sm"
              disabled={statusMutation.isPending}
              onClick={() => runAction(booking, "COMPLETE")}
            >
              Mark complete
            </Button>
          )}
          {!canCheckIn(booking) && !canComplete(booking) && (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-full bg-muted/20">
      <VendorBookingsPageHeader
        locationId={locationId}
        locations={locations}
        onLocationChange={selectLocation}
        onAddBooking={() => setIsAddDialogOpen(true)}
      />
      <div className="space-y-6 p-6">
        <VendorBookingSummaryCards summary={summary} />

        <SplitDataTable
          rows={pagedBookings}
          columns={columns}
          getRowId={getBookingId}
          selectedRowId={selectedBookingId}
          onRowSelect={selectBooking}
          onDetailClose={() => setSelectedBookingId(null)}
          detailTitle="Booking details"
          detailPanel={
            selectedBooking ? (
              <VendorBookingDetailPanel
                booking={selectedBooking}
                isMutating={statusMutation.isPending}
                onClose={() => setSelectedBookingId(null)}
                onAction={runAction}
              />
            ) : null
          }
          isLoading={isLoading}
          error={isError}
          emptyState={
            <TableEmptyState
              title="No bookings found"
              description="Try adjusting your search or filters to find a booking."
            />
          }
          toolbar={
            <TableToolbar
              left={
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <h2 className="text-xl font-semibold">
                    {locationId === "ALL"
                      ? "All Bookings"
                      : locations.find((location) => location.id === locationId)
                          ?.name ?? "Bookings"}
                  </h2>
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9 sm:w-[260px]"
                      placeholder="Search..."
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
              }
              right={
                <Select
                  value={statusFilter}
                  onValueChange={(value: VendorBookingStatusFilter) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-47.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked in</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="PAYMENT_PENDING">Payment pending</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          }
          pagination={
            <DataTablePagination
              page={page}
              pageSize={VENDOR_BOOKINGS_PAGE_SIZE}
              totalItems={filteredBookings.length}
              pageSizeOptions={[VENDOR_BOOKINGS_PAGE_SIZE]}
              onPageChange={setPage}
              onPageSizeChange={() => setPage(1)}
            />
          }
        />
      </div>

      <AddOnSiteBookingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
