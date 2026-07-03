import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  getMyBookings,
} from "@/features/bookings/services/booking.service";
import { getParkingById } from "@/features/parkings/services/parking.service";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { MapIcon, Plus } from "lucide-react";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { toast } from "sonner";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import {
  DriverBookingDetailPanel,
  DriverBookingFilters,
  DriverBookingSummaryCards,
} from "@/features/bookings/components/driver/DriverBookingPageSections";
import { buildDriverBookingColumns } from "@/features/bookings/components/driver/driver-booking-columns";
import {
  PaymentSuccessTicketDialog,
  type PaymentSuccessDetails,
} from "@/features/payments/components/PaymentSuccessTicketDialog";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import {
  buildGoogleMapsDirectionsUrl,
  DRIVER_BOOKINGS_PAGE_SIZE,
  filterDriverBookings,
  type DriverBookingDateFilter,
  type DriverBookingPaymentFilter,
  type DriverBookingStatusFilter,
} from "@/features/bookings/utils/driver-booking-page.utils";

interface DriverBookingsPageProps {
  parkingLocationId?: string;
  payment?: PaymentSuccessDetails;
}

export function DriverBookingsPage({
  parkingLocationId,
  payment,
}: DriverBookingsPageProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DriverBookingStatusFilter>("ALL");
  const [paymentFilter, setPaymentFilter] =
    useState<DriverBookingPaymentFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DriverBookingDateFilter>("ALL");
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
      filterDriverBookings({
        bookings,
        search,
        statusFilter,
        paymentFilter,
        dateFilter,
      }),
    [bookings, dateFilter, paymentFilter, search, statusFilter],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(visibleBookings.length / DRIVER_BOOKINGS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, pageCount);
  const pagedBookings = visibleBookings.slice(
    (currentPage - 1) * DRIVER_BOOKINGS_PAGE_SIZE,
    currentPage * DRIVER_BOOKINGS_PAGE_SIZE,
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

  const tableColumns = useMemo(() => buildDriverBookingColumns(), []);

  const compactTableColumns = useMemo(
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

  return (
    <>
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
        <DriverBookingSummaryCards bookings={bookings} loading={isLoading} />

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
          loadingRowCount={DRIVER_BOOKINGS_PAGE_SIZE}
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
            <DriverBookingFilters
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
              pageSize={DRIVER_BOOKINGS_PAGE_SIZE}
              totalItems={visibleBookings.length}
              pageSizeOptions={[DRIVER_BOOKINGS_PAGE_SIZE]}
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
    </>
  );
}
