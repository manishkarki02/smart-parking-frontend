import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { queryKeys } from "@/config/query-keys";
import {
  getVendorBookings,
  type VendorBooking,
} from "@/features/bookings/services/booking.service";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import {
  getMyParkingLocations,
  updateVendorBookingStatus,
} from "@/features/vendor/services/vendor.service";
import type {
  VendorBookingPaymentMethodFilter,
  VendorBookingStatusFilter,
  VendorBookingSummary,
} from "@/features/vendor/types/vendor-booking.types";
import {
  getBookingId,
  getCustomerName,
  getCustomerPhone,
  getOperationalStatus,
  getSlot,
  getSourceLabel,
  matchesStatusFilter,
  VENDOR_BOOKINGS_PAGE_SIZE,
} from "@/features/vendor/utils/vendor-booking.utils";

export function useVendorBookingsPageState() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<VendorBookingStatusFilter>("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<VendorBookingPaymentMethodFilter>("ALL");
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

      const matchesPayment =
        paymentMethodFilter === "ALL" ||
        booking.paymentMethod?.toUpperCase() === paymentMethodFilter;

      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        matchesStatusFilter(booking, statusFilter) &&
        matchesPayment
      );
    });
  }, [bookings, paymentMethodFilter, search, statusFilter]);

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
        queryKey: queryKeys.bookings.vendorRoot(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.vendor.dashboardRoot(),
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

  function setSearchFilter(value: string) {
    setSearch(value);
    setPage(1);
  }

  function setStatus(value: VendorBookingStatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function setPaymentMethod(value: VendorBookingPaymentMethodFilter) {
    setPaymentMethodFilter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentMethodFilter("ALL");
    setPage(1);
  }

  return {
    isAuthorized,
    locations,
    locationId,
    search,
    statusFilter,
    paymentMethodFilter,
    summary,
    pagedBookings,
    filteredCount: filteredBookings.length,
    selectedBooking,
    selectedBookingId,
    currentPage,
    totalPages,
    isLoading,
    isError,
    isMutating: statusMutation.isPending,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectLocation,
    setSearchFilter,
    setStatus,
    setPaymentMethod,
    resetFilters,
    selectBooking,
    closeSelectedBooking: () => setSelectedBookingId(null),
    runAction,
    previousPage: () => setPage((value) => Math.max(1, value - 1)),
    nextPage: () => setPage((value) => Math.min(totalPages, value + 1)),
  };
}
