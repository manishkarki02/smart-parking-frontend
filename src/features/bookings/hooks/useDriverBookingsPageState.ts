import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { queryKeys } from "@/config/query-keys";
import { buildDriverBookingColumns } from "@/features/bookings/components/driver/driver-booking-columns";
import {
  cancelBooking,
  getMyBookings,
} from "@/features/bookings/services/booking.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { getParkingById } from "@/features/parkings/services/parking.service";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type { PaymentSuccessDetails } from "@/features/payments/components/PaymentSuccessTicketDialog";
import {
  buildGoogleMapsDirectionsUrl,
  DRIVER_BOOKINGS_PAGE_SIZE,
  filterDriverBookings,
  type DriverBookingDateFilter,
  type DriverBookingPaymentFilter,
  type DriverBookingStatusFilter,
} from "@/features/bookings/utils/driver-booking-page.utils";

type UseDriverBookingsPageStateOptions = {
  parkingLocationId?: string;
  payment?: PaymentSuccessDetails;
};

export function useDriverBookingsPageState({
  parkingLocationId,
  payment,
}: UseDriverBookingsPageStateOptions) {
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
      const cancelledBooking = bookings.find(
        (booking) => booking.bookingId === cancelBookingId,
      );
      setCancelBookingId(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.me() });
      if (cancelledBooking) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.parking.detail(cancelledBooking.parkingLocationId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.parking.slots(cancelledBooking.parkingLocationId),
        });
      }
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  useEffect(() => {
    if (!payment?.paymentSuccess) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.me() });
    void queryClient.invalidateQueries({ queryKey: ["PARKING"] });
  }, [payment?.paymentSuccess, queryClient]);

  const receiptBookingId = receiptPayment?.bookingId ?? payment?.bookingId;
  const paidBooking = useMemo(
    () =>
      receiptBookingId
        ? bookings.find((booking) => booking.bookingId === receiptBookingId)
        : undefined,
    [bookings, receiptBookingId],
  );

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

  async function handlePay(booking: BookingResponse) {
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
  }

  async function handleNavigateToParking(booking: BookingResponse) {
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
  }

  function selectBooking(booking: BookingResponse) {
    setSelectedBookingId((current) =>
      current === booking.bookingId ? null : booking.bookingId,
    );
  }

  function closeSelectedBooking() {
    setSelectedBookingId(null);
  }

  function openReceipt(booking: BookingResponse) {
    setReceiptPayment({
      paymentSuccess: true,
      bookingId: booking.bookingId,
      paymentId: booking.paymentId,
      status: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      amount: Number(booking.totalAmount),
      paidAt: booking.paidAt,
    });
  }

  function closePaymentTicket() {
    setReceiptPayment(null);
    void navigate({ to: "/bookings", search: {} });
  }

  function closeAddBookingDialog() {
    setIsAddBookingOpen(false);
    if (parkingLocationId) {
      void navigate({ to: "/bookings", search: {} });
    }
  }

  function handleAddBookingOpenChange(open: boolean) {
    if (open) {
      setIsAddBookingOpen(true);
      return;
    }

    closeAddBookingDialog();
  }

  function openParkingMap() {
    void navigate({ to: "/parkings/map" });
  }

  function resetPage() {
    setPage(1);
  }

  return {
    bookings,
    isLoading,
    search,
    statusFilter,
    paymentFilter,
    dateFilter,
    tableColumns,
    compactTableColumns,
    visibleBookings,
    pagedBookings,
    selectedBooking,
    selectedBookingId,
    currentPage,
    isPaymentTicketOpen,
    isAddBookingDialogOpen,
    cancelBookingId,
    cancelMutation,
    receiptPayment,
    paidBooking,
    setSearch,
    setStatusFilter,
    setPaymentFilter,
    setDateFilter,
    setPage,
    setIsAddBookingOpen,
    setCancelBookingId,
    selectBooking,
    closeSelectedBooking,
    openReceipt,
    handlePay,
    handleNavigateToParking,
    closePaymentTicket,
    closeAddBookingDialog,
    handleAddBookingOpenChange,
    openParkingMap,
    resetPage,
  };
}
