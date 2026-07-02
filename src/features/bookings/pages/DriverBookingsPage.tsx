import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  getMyBookings,
} from "@/features/bookings/services/booking.service";
import { getParkingById } from "@/features/parkings/services/parking.service";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapIcon,
  MapPinned,
  Plus,
  ReceiptText,
  Search,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { toast } from "sonner";
import { AppLayout } from "@/common/components/AppLayout";
import { PageHeader } from "@/common/components/PageHeader";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingTime,
  formatVehicleType,
} from "@/features/bookings/utils/booking-formatters";
import {
  PaymentSuccessTicketDialog,
  type PaymentSuccessDetails,
} from "@/features/payments/components/PaymentSuccessTicketDialog";
import { cn } from "@/lib/utils";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
  type DataTableColumn,
} from "@/common";

interface DriverBookingsPageProps {
  parkingLocationId?: string;
  payment?: PaymentSuccessDetails;
}

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type PaymentFilter = "ALL" | "PENDING" | "SUCCESS" | "FAILED";
type DateFilter = "ALL" | "TODAY" | "UPCOMING" | "PAST";

const PAGE_SIZE = 7;

export function DriverBookingsPage({
  parkingLocationId,
  payment,
}: DriverBookingsPageProps) {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["DRIVER"] });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [page, setPage] = useState(1);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [receiptPayment, setReceiptPayment] =
    useState<PaymentSuccessDetails | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.me(),
    queryFn: getMyBookings,
    enabled: isAuthorized,
  });

  const cancelMutation = useCustomMutation({
    api: cancelBooking,
    onSuccess: () => {
      setCancelBookingId(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.me() });
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  const receiptBookingId = receiptPayment?.bookingId ?? payment?.bookingId;
  const paidBooking = useMemo(
    () =>
      receiptBookingId
        ? bookings.find((booking) => booking.bookingId === receiptBookingId)
        : undefined,
    [bookings, receiptBookingId],
  );

  const handlePay = async (booking: BookingResponse) => {
    try {
      const payment = await initiatePayment({
        bookingId: booking.bookingId,
        paymentMethod: "KHALTI",
      });

      if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank");
      } else {
        toast.info("Payment initiated. Transaction ID: " + payment.transactionId);
      }
    } catch {
      toast.error("Failed to initiate payment");
    }
  };

  const handleNavigateToParking = async (booking: BookingResponse) => {
    try {
      const parking = await queryClient.fetchQuery({
        queryKey: queryKeys.parking.detail(booking.parkingLocationId),
        queryFn: () => getParkingById(booking.parkingLocationId),
      });

      window.open(
        buildGoogleMapsDirectionsUrl({
          latitude: parking.latitude,
          longitude: parking.longitude,
          fallback: parking.address || parking.name,
        }),
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      window.open(
        buildGoogleMapsDirectionsUrl({
          fallback: booking.parkingLocationName,
        }),
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const visibleBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const keyword = search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          [
            booking.bookingId,
            booking.customerName,
            booking.customerPhone,
            booking.driverName,
            booking.parkingLocationName,
            booking.slotNumber,
            booking.slotStatus,
            booking.status,
            booking.vehicleNumber,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));

        const matchesStatus =
          statusFilter === "ALL" ||
          booking.status.toUpperCase() === statusFilter;
        const matchesPayment =
          paymentFilter === "ALL" ||
          (booking.paymentStatus ?? "PENDING").toUpperCase() === paymentFilter;
        const matchesDate = matchesDateFilter(booking, dateFilter);

        return matchesSearch && matchesStatus && matchesPayment && matchesDate;
      }),
    [bookings, dateFilter, paymentFilter, search, statusFilter],
  );

  const pageCount = Math.max(1, Math.ceil(visibleBookings.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedBookings = visibleBookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selectedBooking = useMemo(
    () =>
      visibleBookings.find(
        (booking) => booking.bookingId === selectedBookingId,
      ) ?? null,
    [visibleBookings, selectedBookingId],
  );
  const isPaymentTicketOpen = Boolean(payment?.paymentSuccess || receiptPayment);
  const isAddBookingDialogOpen = Boolean(parkingLocationId) || isAddBookingOpen;

  const tableColumns = useMemo<DataTableColumn<BookingResponse>[]>(
    () => [
      {
        id: "bookingId",
        header: "Booking ID",
        cell: (booking) => (
          <span className="font-mono text-xs font-semibold text-blue-600">
            {shortId(booking.bookingId)}
          </span>
        ),
      },
      {
        id: "location",
        header: "Parking",
        cell: (booking) => (
          <span className="block max-w-40 truncate text-sm font-semibold text-slate-950">
            {booking.parkingLocationName}
          </span>
        ),
      },
      {
        id: "slot",
        header: "Slot",
        cell: (booking) => <SlotBadge slotNumber={booking.slotNumber} />,
        compact: true,
      },
      {
        id: "vehicle",
        header: "Vehicle",
        cell: (booking) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-950">
              {booking.vehicleNumber ?? "-"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {formatVehicleType(booking.vehicleType)}
            </p>
          </div>
        ),
      },
      {
        id: "timing",
        header: "Timing",
        cell: (booking) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-950">
              {formatBookingTime(booking.startTime)} -{" "}
              {formatBookingTime(booking.endTime)}
            </p>
            <p className="text-xs text-slate-500">
              {formatBookingDate(booking.startTime)}
            </p>
          </div>
        ),
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
      },
      {
        id: "payment",
        header: "Payment",
        cell: (booking) => <PaymentBadge status={booking.paymentStatus} />,
      },
      {
        id: "amount",
        header: "Amount",
        align: "right",
        cell: (booking) => (
          <span className="text-xs font-bold text-slate-950">
            {formatBookingAmount(booking.totalAmount)}
          </span>
        ),
      },
    ],
    [],
  );

  const compactTableColumns = useMemo<DataTableColumn<BookingResponse>[]>(
    () => [
      tableColumns[0],
      tableColumns[2],
      tableColumns[3],
      tableColumns[4],
      tableColumns[5],
      tableColumns[6],
      tableColumns[7],
    ],
    [tableColumns],
  );

  const closePaymentTicket = () => {
    setReceiptPayment(null);
    void navigate({ to: "/bookings", search: {} });
  };

  const closeAddBookingDialog = () => {
    setIsAddBookingOpen(false);
    if (parkingLocationId) {
      void navigate({ to: "/bookings", search: {} });
    }
  };

  const handleAddBookingOpenChange = (open: boolean) => {
    if (open) {
      setIsAddBookingOpen(true);
      return;
    }

    closeAddBookingDialog();
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <AppLayout mainClassName="bg-slate-50">
      <PageHeader
        title="My Bookings"
        content={
          <div className="min-w-0 py-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
              My Bookings
            </h1>
            <p className="truncate text-sm text-slate-500">
              Track your parking reservations and payment status
            </p>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 bg-white shadow-none"
              onClick={() => navigate({ to: "/parkings/map" })}
            >
              <MapIcon className="size-4" />
              Find Parking
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddBookingOpen(true)}
            >
              <Plus className="size-4" />
              Add Booking
            </Button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-4">
        <BookingSummaryCards bookings={bookings} loading={isLoading} />

        <SplitDataTable
          columns={tableColumns}
          compactColumns={compactTableColumns}
          rows={pagedBookings}
          getRowId={(booking) => booking.bookingId}
          selectedRowId={selectedBooking ? selectedBookingId : null}
          onRowSelect={(booking) =>
            setSelectedBookingId((current) =>
              current === booking.bookingId ? null : booking.bookingId,
            )
          }
          onDetailClose={() => setSelectedBookingId(null)}
          detailTitle={
            selectedBooking ? selectedBooking.parkingLocationName : "Booking details"
          }
          detailPanel={
            <DriverBookingDetailPanel
              booking={selectedBooking}
              onPay={handlePay}
              onCancel={setCancelBookingId}
              onReceipt={(booking) =>
                setReceiptPayment({
                  paymentSuccess: true,
                  bookingId: booking.bookingId,
                  paymentId: booking.paymentId,
                  status: booking.paymentStatus,
                  paymentMethod: booking.paymentMethod,
                  amount: Number(booking.totalAmount),
                  paidAt: booking.paidAt,
                })
              }
              onNavigate={handleNavigateToParking}
              onClose={() => setSelectedBookingId(null)}
            />
          }
          isLoading={isLoading}
          loadingRowCount={PAGE_SIZE}
          splitContainerClassName="min-h-0 items-stretch"
          emptyState={
            <TableEmptyState
              title={bookings.length === 0 ? "No bookings found" : "No bookings match"}
              description={
                bookings.length === 0
                  ? "Your parking reservations will appear here after you book a slot."
                  : "Try adjusting the search, status, payment, or date filters."
              }
            />
          }
          toolbar={
            <BookingFilters
              search={search}
              statusFilter={statusFilter}
              paymentFilter={paymentFilter}
              dateFilter={dateFilter}
              onSearchChange={setSearch}
              onStatusChange={setStatusFilter}
              onPaymentChange={setPaymentFilter}
              onDateChange={setDateFilter}
              onResetPage={() => setPage(1)}
            />
          }
          pagination={
            <DataTablePagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              totalItems={visibleBookings.length}
              pageSizeOptions={[PAGE_SIZE]}
              onPageChange={setPage}
              onPageSizeChange={() => setPage(1)}
            />
          }
        />
      </div>

      <ConfirmDialog
        open={cancelBookingId !== null}
        onOpenChange={(open) => !open && setCancelBookingId(null)}
        title="Cancel this booking?"
        description="This action cannot be undone."
        confirmLabel="Cancel booking"
        onConfirm={() => {
          if (cancelBookingId) {
            cancelMutation.mutate(cancelBookingId);
          }
        }}
        isLoading={cancelMutation.isPending}
      />

      <Dialog
        open={isAddBookingDialogOpen}
        onOpenChange={handleAddBookingOpenChange}
      >
        <DialogContent
          className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-[560px]"
          showCloseButton
        >
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-lg font-bold text-slate-950">
              Add Booking
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Select a parking location, slot, vehicle, and booking time.
            </DialogDescription>
          </DialogHeader>

          <BookingForm
            variant="dialog"
            preselectedParkingId={parkingLocationId}
            navigateOnSuccess={false}
            onSuccess={closeAddBookingDialog}
          />
        </DialogContent>
      </Dialog>

      <PaymentSuccessTicketDialog
        open={isPaymentTicketOpen}
        payment={receiptPayment ?? payment ?? {}}
        booking={paidBooking}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentTicket();
          }
        }}
      />
    </AppLayout>
  );
}

function BookingSummaryCards({
  bookings,
  loading,
}: {
  bookings: BookingResponse[];
  loading: boolean;
}) {
  const stats = getBookingStats(bookings);

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard
        label="Active"
        value={stats.active}
        chip="Confirmed"
        chipClassName="border-blue-200 bg-blue-50 text-blue-700"
        icon={Clock3}
        iconClassName="bg-blue-50 text-blue-600"
        loading={loading}
      />
      <SummaryCard
        label="Upcoming"
        value={stats.upcoming}
        chip="Pending"
        chipClassName="border-amber-200 bg-amber-50 text-amber-700"
        icon={CalendarDays}
        iconClassName="bg-amber-50 text-amber-600"
        loading={loading}
      />
      <SummaryCard
        label="Completed"
        value={stats.completed}
        chip="Paid"
        chipClassName="border-green-200 bg-green-50 text-green-700"
        icon={CheckCircle2}
        iconClassName="bg-green-50 text-green-600"
        loading={loading}
      />
      <SummaryCard
        label="Cancelled"
        value={stats.cancelled}
        chip="Cancelled"
        chipClassName="border-red-200 bg-red-50 text-red-700"
        icon={XCircle}
        iconClassName="bg-red-50 text-red-600"
        loading={loading}
      />
      <SummaryCard
        label="Pending Payment"
        value={stats.pendingPayment}
        chip="Unpaid"
        chipClassName="border-orange-200 bg-orange-50 text-orange-700"
        icon={CreditCard}
        iconClassName="bg-orange-50 text-orange-600"
        loading={loading}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  chip,
  chipClassName,
  icon: Icon,
  iconClassName,
  loading,
}: {
  label: string;
  value: number;
  chip: string;
  chipClassName: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  loading: boolean;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex min-h-[110px] flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md",
              iconClassName,
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
            <Badge variant="outline" className={cn("mt-1", chipClassName)}>
              <span className="size-1.5 rounded-full bg-current" />
              {chip}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingFilters({
  search,
  statusFilter,
  paymentFilter,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onDateChange,
  onResetPage,
}: {
  search: string;
  statusFilter: StatusFilter;
  paymentFilter: PaymentFilter;
  dateFilter: DateFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onPaymentChange: (value: PaymentFilter) => void;
  onDateChange: (value: DateFilter) => void;
  onResetPage: () => void;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onResetPage();
            }}
            placeholder="Search by booking ID, location, slot, vehicle..."
            className="h-9 border-slate-200 bg-slate-50 pl-9 shadow-none"
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(value) => {
            onStatusChange(value);
            onResetPage();
          }}
          items={[
            ["ALL", "All Status"],
            ["PENDING", "Pending"],
            ["CONFIRMED", "Confirmed"],
            ["CANCELLED", "Cancelled"],
            ["COMPLETED", "Completed"],
          ]}
        />
        <FilterSelect
          value={paymentFilter}
          onChange={(value) => {
            onPaymentChange(value);
            onResetPage();
          }}
          items={[
            ["ALL", "All Payments"],
            ["PENDING", "Pending"],
            ["SUCCESS", "Paid"],
            ["FAILED", "Failed"],
          ]}
        />
        <FilterSelect
          value={dateFilter}
          onChange={(value) => {
            onDateChange(value);
            onResetPage();
          }}
          items={[
            ["ALL", "Date range"],
            ["TODAY", "Today"],
            ["UPCOMING", "Upcoming"],
            ["PAST", "Past"],
          ]}
        />
      </CardContent>
    </Card>
  );
}

function FilterSelect<TValue extends string>({
  value,
  onChange,
  items,
}: {
  value: TValue;
  onChange: (value: TValue) => void;
  items: Array<[TValue, string]>;
}) {
  return (
    <Select value={value} onValueChange={(nextValue) => onChange(nextValue as TValue)}>
      <SelectTrigger className="h-9 min-w-36 border-slate-200 bg-white shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DriverBookingDetailPanel({
  booking,
  onPay,
  onCancel,
  onReceipt,
  onNavigate,
  onClose,
}: {
  booking: BookingResponse | null;
  onPay: (booking: BookingResponse) => Promise<void>;
  onCancel: (bookingId: string) => void;
  onReceipt: (booking: BookingResponse) => void;
  onNavigate: (booking: BookingResponse) => void | Promise<void>;
  onClose: () => void;
}) {
  if (!booking) {
    return (
      <Card className="rounded-lg border-dashed border-slate-200 bg-white shadow-none">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
          <ReceiptText className="size-9 text-slate-400" />
          <h2 className="mt-3 text-sm font-semibold text-slate-950">
            Select a booking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Booking details and actions will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canPay = canPayForBooking(booking);
  const canCancel = canCancelBooking(booking);
  const canShowReceipt = booking.paymentStatus === "SUCCESS";

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex flex-col p-0">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-950">
              {booking.parkingLocationName}
            </h2>
            <p className="mt-1 truncate font-mono text-xs text-slate-500">
              {booking.bookingId}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <BookingStatusBadge
                status={booking.status}
                slotStatus={booking.slotStatus}
              />
              <PaymentBadge status={booking.paymentStatus} />
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 text-slate-500 hover:text-slate-950"
            aria-label="Close booking details"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 p-4">
          <DetailSection title="Booking Details">
            <DetailGrid>
              <DetailItem label="Location" value={booking.parkingLocationName} />
              <DetailItem label="Slot" value={booking.slotNumber} badge />
              <DetailItem label="Vehicle Number" value={booking.vehicleNumber ?? "-"} />
              <DetailItem
                label="Vehicle Type"
                value={formatVehicleType(booking.vehicleType)}
              />
              <DetailItem label="Vendor" value={booking.driverName ?? "-"} />
              <DetailItem label="Source" value={booking.walkIn ? "Walk-in" : "App driver"} />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Timing">
            <DetailGrid>
              <DetailItem
                label="Start"
                value={formatBookingDateTime(booking.startTime)}
              />
              <DetailItem
                label="End"
                value={formatBookingDateTime(booking.endTime)}
              />
              <DetailItem label="Duration" value={formatDuration(booking)} />
              <DetailItem
                label="Total Amount"
                value={formatBookingAmount(booking.totalAmount)}
                accent
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Payment">
            <DetailGrid>
              <DetailItem
                label="Payment Method"
                value={booking.paymentMethod ?? "-"}
              />
              <DetailItem
                label="Payment Status"
                value={paymentStatusLabel(booking.paymentStatus)}
              />
              <DetailItem label="Payment ID" value={booking.paymentId ?? "-"} />
              <DetailItem
                label="Paid At"
                value={
                  booking.paidAt ? formatBookingDateTime(booking.paidAt) : "-"
                }
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Refund">
            <DetailGrid>
              <DetailItem label="Refund Status" value="Not available" />
              <DetailItem label="Refund Eligible" value="Not available" />
            </DetailGrid>
          </DetailSection>
        </div>

        <div className="shrink-0 space-y-2 border-t bg-white p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => void onNavigate(booking)}
          >
            <MapPinned className="size-4" />
            Navigate to Parking
          </Button>
          {canPay ? (
            <Button
              type="button"
              className="w-full gap-2"
              onClick={() => void onPay(booking)}
            >
              <WalletCards className="size-4" />
              Pay / Retry Payment
            </Button>
          ) : null}
          {canShowReceipt ? (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => onReceipt(booking)}
            >
              <ReceiptText className="size-4" />
              View Receipt
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2 bg-red-100 text-red-700 hover:bg-red-200"
              onClick={() => onCancel(booking.bookingId)}
            >
              <CalendarX2 className="size-4" />
              Cancel Booking
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SlotBadge({ slotNumber }: { slotNumber: string }) {
  return (
    <Badge
      variant="outline"
      className="border-blue-200 bg-blue-50 font-mono text-blue-700"
    >
      {slotNumber}
    </Badge>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 pb-4 last:border-b-0">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function DetailItem({
  label,
  value,
  badge,
  accent,
}: {
  label: string;
  value: string;
  badge?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      {badge ? (
        <Badge
          variant="outline"
          className="mt-1 border-blue-200 bg-blue-50 font-mono text-blue-700"
        >
          {value}
        </Badge>
      ) : (
        <p
          className={cn(
            "mt-1 break-words text-sm font-semibold text-slate-950",
            accent && "text-blue-700",
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function PaymentBadge({ status }: { status?: string | null }) {
  const label = paymentStatusLabel(status);
  const className =
    status === "SUCCESS"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "FAILED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <Badge variant="outline" className={className}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

function getBookingStats(bookings: BookingResponse[]) {
  return bookings.reduce(
    (stats, booking) => {
      const status = booking.status.toUpperCase();
      const paymentStatus = booking.paymentStatus ?? "PENDING";
      if (status === "CONFIRMED") stats.active += 1;
      if (status === "PENDING") stats.upcoming += 1;
      if (status === "COMPLETED") stats.completed += 1;
      if (status === "CANCELLED") stats.cancelled += 1;
      if (paymentStatus !== "SUCCESS") stats.pendingPayment += 1;
      return stats;
    },
    {
      active: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      pendingPayment: 0,
    },
  );
}

function matchesDateFilter(booking: BookingResponse, filter: DateFilter) {
  if (filter === "ALL") return true;

  const start = new Date(booking.startTime);
  const now = new Date();

  if (filter === "TODAY") {
    return start.toDateString() === now.toDateString();
  }

  if (filter === "UPCOMING") {
    return start.getTime() >= now.getTime();
  }

  return start.getTime() < now.getTime();
}

function canPayForBooking(booking: BookingResponse) {
  const status = booking.status.toUpperCase();
  const paymentStatus = booking.paymentStatus ?? "PENDING";
  return (
    status !== "CANCELLED" &&
    status !== "COMPLETED" &&
    paymentStatus !== "SUCCESS"
  );
}

function canCancelBooking(booking: BookingResponse) {
  const status = booking.status.toUpperCase();
  return status === "PENDING" || status === "CONFIRMED";
}

function shortId(value: string) {
  return `${value.slice(0, 8)}...`;
}

function paymentStatusLabel(status?: string | null) {
  if (status === "SUCCESS") return "Paid";
  if (status === "FAILED") return "Failed";
  return "Pending";
}

function formatDuration(booking: BookingResponse) {
  const start = new Date(booking.startTime).getTime();
  const end = new Date(booking.endTime).getTime();
  const durationMs = end - start;

  if (!Number.isFinite(durationMs) || durationMs <= 0) return "-";

  const minutes = Math.round(durationMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }
  if (hours > 0) return `${hours} hr`;
  return `${remainingMinutes} min`;
}

function buildGoogleMapsDirectionsUrl({
  latitude,
  longitude,
  fallback,
}: {
  latitude?: number;
  longitude?: number;
  fallback: string;
}) {
  const destination =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
      ? `${latitude},${longitude}`
      : fallback;

  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
