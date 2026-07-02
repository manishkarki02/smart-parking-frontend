import { useMemo, useState, type ComponentType } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  LogIn,
  Minus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import useDebounce from "@/common/hooks/useDebounce";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/config/query-keys";
import {
  getVendorBookings,
  type VendorBooking,
} from "@/features/bookings/services/booking.service";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { VendorBookingDetailPanel } from "@/features/vendor/components/VendorBookingDetailPanel";
import { VendorBookingStatusBadge } from "@/features/vendor/components/VendorBookingStatusBadge";
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
import { cn } from "@/lib/utils";

type PaymentMethodFilter = "ALL" | "CASH" | "KHALTI" | "ESEWA";
type StatAccent = "blue" | "orange" | "green" | "purple";

const statAccentStyles: Record<StatAccent, string> = {
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
};

export function VendorBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] =
    useState<VendorBookingStatusFilter>("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<PaymentMethodFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const vendorLocationId = locationId === "ALL" ? undefined : locationId;

  const { data: locations = [] } = useCustomQuery({
    key: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
    options: { enabled: isAuthorized },
  });

  const { data, isLoading, isError } = useCustomQuery({
    key: queryKeys.bookings.vendor({
      search: debouncedSearch,
      page,
      locationId: vendorLocationId,
      status: statusFilter,
    }),
    queryFn: () => getVendorBookings({ locationId: vendorLocationId }),
    options: { enabled: isAuthorized },
  });

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

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

      const matchesPayment =
        paymentMethodFilter === "ALL" ||
        booking.paymentMethod?.toUpperCase() === paymentMethodFilter;

      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        matchesStatusFilter(booking, statusFilter) &&
        matchesPayment
      );
    });
  }, [bookings, paymentMethodFilter, debouncedSearch, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / VENDOR_BOOKINGS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedBookings = filteredBookings.slice(
    (currentPage - 1) * VENDOR_BOOKINGS_PAGE_SIZE,
    currentPage * VENDOR_BOOKINGS_PAGE_SIZE,
  );
  const selectedBooking =
    filteredBookings.find(
      (booking) => getBookingId(booking) === selectedBookingId,
    ) ?? null;

  const summary = useMemo<VendorBookingSummary>(() => {
    const completedTotal = filteredBookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const revenue = filteredBookings
      .filter(
        (booking) =>
          booking.paymentStatus === "SUCCESS" || booking.status === "COMPLETED",
      )
      .reduce(
        (total, booking) =>
          total + Number(booking.totalAmount ?? booking.amount ?? 0),
        0,
      );

    return {
      total: filteredBookings.length,
      active: filteredBookings.filter(
        (booking) =>
          booking.slotStatus === "RESERVED" ||
          booking.slotStatus === "BOOKED" ||
          booking.slotStatus === "OCCUPIED",
      ).length,
      completed: completedTotal,
      revenue,
      completedHelper: "Current filter",
    };
  }, [filteredBookings]);

  const statusMutation = useCustomMutation({
    api: updateVendorBookingStatus,
    onSuccess: (updatedBooking) => {
      toast.success("Booking updated");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.vendor(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.vendor.dashboard(),
      });
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
          queryKey: queryKeys.parking.vendorSlots(
            selectedBooking.parkingLocationId,
          ),
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

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentMethodFilter("ALL");
    setPage(1);
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-full min-w-0 overflow-x-hidden bg-slate-50">
      <VendorBookingsPageHeader
        locationId={locationId}
        locations={locations}
        onLocationChange={selectLocation}
        onAddBooking={() => setIsAddDialogOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
        <section className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total"
            value={summary.total}
            helper="Bookings"
            icon={ClipboardList}
            accent="blue"
          />
          <SummaryCard
            label="Active now"
            value={summary.active}
            helper="Reserved + Booked + Occupied"
            icon={Car}
            accent="orange"
          />
          <SummaryCard
            label="Completed"
            value={summary.completed}
            helper={summary.completedHelper}
            icon={CheckCircle2}
            accent="green"
          />
          <SummaryCard
            label="Revenue"
            value={`Rs ${summary.revenue.toFixed(0)}`}
            helper="Paid / completed"
            icon={Banknote}
            accent="purple"
          />
        </section>

        <Card className="min-w-0 overflow-hidden border-slate-200 bg-white shadow-none">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                <h2 className="shrink-0 text-base font-semibold text-slate-950">
                  All Bookings
                </h2>
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search customer, slot, vehicle..."
                    className="h-9 border-slate-200 pl-9 text-sm shadow-none"
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                  value={statusFilter}
                  onValueChange={(value: VendorBookingStatusFilter) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-full border-slate-200 text-sm shadow-none sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked in</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="PAYMENT_PENDING">
                      Payment pending
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={paymentMethodFilter}
                  onValueChange={(value: PaymentMethodFilter) => {
                    setPaymentMethodFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-full border-slate-200 text-sm shadow-none sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Payment method</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="KHALTI">Khalti</SelectItem>
                    <SelectItem value="ESEWA">Esewa</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-slate-200 shadow-none"
                  onClick={resetFilters}
                >
                  <Filter className="size-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "grid min-w-0",
                selectedBooking
                  ? "xl:grid-cols-[minmax(0,1fr)_360px]"
                  : "grid-cols-1",
              )}
            >
              <div className="min-w-0">
                <div className="max-w-full overflow-x-auto">
                  <Table className="min-w-[920px]">
                    <TableHeader className="bg-slate-100/80">
                      <TableRow className="hover:bg-transparent">
                        {[
                          "ID",
                          "Customer",
                          "Source",
                          "Location",
                          "Slot",
                          "Time",
                          "Amount",
                          "Payment",
                          "Status",
                          "Action",
                        ].map((header) => (
                          <TableHead
                            key={header}
                            className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                          >
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableMessageRow message="Loading bookings..." />
                      ) : isError ? (
                        <TableMessageRow message="Unable to load bookings." />
                      ) : pagedBookings.length === 0 ? (
                        <TableMessageRow message="No bookings found." />
                      ) : (
                        pagedBookings.map((booking) => (
                          <BookingTableRow
                            key={getBookingId(booking)}
                            booking={booking}
                            selected={
                              getBookingId(booking) === selectedBookingId
                            }
                            isMutating={statusMutation.isPending}
                            onSelect={() => selectBooking(booking)}
                            onAction={runAction}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedBooking ? (
                <VendorBookingDetailPanel
                  booking={selectedBooking}
                  isMutating={statusMutation.isPending}
                  onClose={() => setSelectedBookingId(null)}
                  onAction={runAction}
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {pagedBookings.length} of {filteredBookings.length}{" "}
                bookings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <Button type="button" size="sm" className="w-9 px-0">
                  {currentPage}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <AddOnSiteBookingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  accent: StatAccent;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="p-5">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-md",
            statAccentStyles[accent],
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 text-sm text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function BookingTableRow({
  booking,
  selected,
  isMutating,
  onSelect,
  onAction,
}: {
  booking: VendorBooking;
  selected: boolean;
  isMutating: boolean;
  onSelect: () => void;
  onAction: (booking: VendorBooking, action: VendorBookingAction) => void;
}) {
  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      className="cursor-pointer border-slate-200 data-[state=selected]:bg-blue-50/80"
      onClick={onSelect}
    >
      <TableCell className="px-4 font-mono text-xs font-semibold text-slate-500">
        {getBookingId(booking).slice(0, 8)}
      </TableCell>
      <TableCell className="px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {getCustomerName(booking)}
          </p>
          <p className="truncate font-mono text-xs text-slate-500">
            {getCustomerPhone(booking)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <SourceBadge booking={booking} />
      </TableCell>
      <TableCell className="max-w-38 px-4">
        <span className="block truncate text-sm font-medium text-slate-950">
          {booking.parkingLocationName ?? "-"}
        </span>
      </TableCell>
      <TableCell className="px-4">
        <SlotBadge booking={booking} />
      </TableCell>
      <TableCell className="px-4">
        <div className="min-w-30">
          <p className="text-xs font-bold text-slate-950">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(booking.startTime)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4 text-sm font-bold text-slate-950">
        {formatAmount(booking)}
      </TableCell>
      <TableCell className="px-4">
        <div className="flex flex-col items-start gap-1">
          <PaymentMethodBadge method={booking.paymentMethod} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </TableCell>
      <TableCell className="px-4">
        <VendorBookingStatusBadge booking={booking} />
      </TableCell>
      <TableCell className="px-4">
        <div data-row-action="true" onClick={(event) => event.stopPropagation()}>
          {canCheckIn(booking) ? (
            <Button
              type="button"
              size="sm"
              disabled={isMutating}
              className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
              onClick={() => onAction(booking, "CHECK_IN")}
            >
              <LogIn className="size-3.5" />
              Check in
            </Button>
          ) : null}
          {canComplete(booking) ? (
            <Button
              type="button"
              size="sm"
              disabled={isMutating}
              className="h-8 bg-green-600 text-xs hover:bg-green-700"
              onClick={() => onAction(booking, "COMPLETE")}
            >
              <CheckCircle2 className="size-3.5" />
              Complete
            </Button>
          ) : null}
          {!canCheckIn(booking) && !canComplete(booking) ? (
            booking.status === "COMPLETED" || booking.status === "CANCELLED" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="h-8 w-10 text-xs"
              >
                <Minus className="size-3.5" />
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" className="h-8">
                <Eye className="size-3.5" />
                View
              </Button>
            )
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableMessageRow({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={10}
        className="h-52 px-4 text-center text-sm text-slate-500"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function SourceBadge({ booking }: { booking: VendorBooking }) {
  const isWalkIn = booking.walkIn;
  return (
    <Badge
      className={cn(
        "border-0 px-2.5 py-1 text-xs font-bold shadow-none",
        isWalkIn
          ? "bg-purple-50 text-purple-700 hover:bg-purple-50"
          : "bg-blue-50 text-blue-700 hover:bg-blue-50",
      )}
    >
      {getSourceLabel(booking)}
    </Badge>
  );
}

function SlotBadge({ booking }: { booking: VendorBooking }) {
  const isFourWheeler = booking.vehicleType === "FOUR_WHEELER";
  return (
    <Badge
      className={cn(
        "border-0 px-2.5 py-1 font-mono text-xs font-bold shadow-none",
        isFourWheeler
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          : "bg-blue-100 text-blue-700 hover:bg-blue-100",
      )}
    >
      {getSlot(booking)}
    </Badge>
  );
}

function PaymentMethodBadge({ method }: { method?: string | null }) {
  const normalized = method?.toUpperCase();
  return (
    <Badge
      className={cn(
        "border px-2.5 py-0.5 text-xs font-bold shadow-none",
        normalized === "CASH"
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
          : "border-purple-200 bg-purple-700 text-white hover:bg-purple-700",
      )}
    >
      {normalized ?? "-"}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status?: string | null }) {
  const label =
    status?.toUpperCase() === "SUCCESS"
      ? "Paid"
      : status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "-";
  return (
    <Badge className="w-fit" variant={getPaymentStatusVariant(status)}>
      {label}
    </Badge>
  );
}
