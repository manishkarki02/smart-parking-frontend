import { useMemo, useState } from "react";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getVendorBookings } from "@/features/bookings/services/booking.service";
import { getMyParkingLocations } from "@/features/vendor/services/vendor.service";
import {
  buildDailyRevenue,
  buildRevenueByLocation,
  buildRevenueByMethod,
  filterRevenueTransactions,
  getAmount,
  getDateRange,
  getRevenueDate,
  isSuccessfulPayment,
  TRANSACTIONS_PAGE_SIZE,
  type DateRangeFilter,
  type TransactionStatusFilter,
} from "@/features/vendor/utils/vendor-earnings.utils";

export function useVendorEarningsPageState() {
  const [locationId, setLocationId] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] =
    useState<DateRangeFilter>("LAST_7_DAYS");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const vendorLocationId = locationId === "ALL" ? undefined : locationId;

  const {
    data: locations = [],
    isLoading: locationsLoading,
  } = useCustomQuery({
    key: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
  });

  const { data, isLoading, isError, refetch } = useCustomQuery({
    key: queryKeys.bookings.vendor({
      locationId: vendorLocationId,
      status: "ALL",
    }),
    queryFn: () => getVendorBookings({ locationId: vendorLocationId }),
  });

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);
  const range = useMemo(
    () => getDateRange(dateRangeFilter),
    [dateRangeFilter],
  );

  const periodBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const date = getRevenueDate(booking);
        return date >= range.start && date <= range.end;
      }),
    [bookings, range],
  );

  const paidBookings = useMemo(
    () => periodBookings.filter(isSuccessfulPayment),
    [periodBookings],
  );

  const failedOrPendingBookings = useMemo(
    () =>
      periodBookings.filter(
        (booking) =>
          booking.paymentStatus === "FAILED" || booking.status === "CANCELLED",
      ),
    [periodBookings],
  );

  const totalRevenue = useMemo(
    () =>
      bookings.filter(isSuccessfulPayment).reduce((sum, booking) => {
        return sum + getAmount(booking);
      }, 0),
    [bookings],
  );
  const periodRevenue = paidBookings.reduce(
    (sum, booking) => sum + getAmount(booking),
    0,
  );
  const pendingPayments = periodBookings
    .filter((booking) => booking.paymentStatus === "PENDING")
    .reduce((sum, booking) => sum + getAmount(booking), 0);
  const issueAmount = failedOrPendingBookings.reduce(
    (sum, booking) => sum + getAmount(booking),
    0,
  );
  const averageRevenue =
    paidBookings.length > 0 ? periodRevenue / paidBookings.length : 0;
  const dailyRevenue = useMemo(
    () => buildDailyRevenue(paidBookings, range),
    [paidBookings, range],
  );

  const revenueByLocation = useMemo(
    () => buildRevenueByLocation({ paidBookings, periodRevenue }),
    [paidBookings, periodRevenue],
  );

  const revenueByMethod = useMemo(
    () => buildRevenueByMethod({ paidBookings, periodRevenue }),
    [paidBookings, periodRevenue],
  );

  const filteredTransactions = useMemo(() => {
    return filterRevenueTransactions({
      periodBookings,
      transactionSearch,
      transactionStatus,
    });
  }, [periodBookings, transactionSearch, transactionStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / TRANSACTIONS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedTransactions = filteredTransactions.slice(
    (currentPage - 1) * TRANSACTIONS_PAGE_SIZE,
    currentPage * TRANSACTIONS_PAGE_SIZE,
  );

  function selectLocation(nextLocationId: string) {
    setLocationId(nextLocationId);
    setPage(1);
  }

  function selectDateRange(nextDateRange: DateRangeFilter) {
    setDateRangeFilter(nextDateRange);
    setPage(1);
  }

  function searchTransactions(nextSearch: string) {
    setTransactionSearch(nextSearch);
    setPage(1);
  }

  function filterTransactionStatus(nextStatus: TransactionStatusFilter) {
    setTransactionStatus(nextStatus);
    setPage(1);
  }

  return {
    locations,
    locationId,
    dateRangeFilter,
    transactionSearch,
    transactionStatus,
    range,
    paidBookings,
    failedOrPendingBookings,
    totalRevenue,
    periodRevenue,
    pendingPayments,
    issueAmount,
    averageRevenue,
    dailyRevenue,
    revenueByLocation,
    revenueByMethod,
    filteredTransactions,
    pagedTransactions,
    currentPage,
    totalPages,
    isLoading: isLoading || locationsLoading,
    isError,
    refetch,
    selectLocation,
    selectDateRange,
    searchTransactions,
    filterTransactionStatus,
    previousPage: () => setPage((value) => Math.max(1, value - 1)),
    nextPage: () => setPage((value) => Math.min(totalPages, value + 1)),
  };
}
