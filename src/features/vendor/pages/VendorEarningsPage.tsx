import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  Clock,
  MapPin,
  Wallet,
} from "lucide-react";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { PageHeader } from "@/common/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/config/query-keys";
import {
  getVendorBookings,
} from "@/features/bookings/services/booking.service";
import { getMyParkingLocations } from "@/features/vendor/services/vendor.service";
import {
  DailyRevenueCard,
  EarningsLoadingState,
  PaymentMethodBreakdownCard,
  RevenueByLocationCard,
  SettlementTimelineCard,
  SummaryCard,
  TransactionsCard,
} from "@/features/vendor/components/earnings/VendorEarningsSections";
import {
  buildDailyRevenue,
  buildRevenueByLocation,
  buildRevenueByMethod,
  filterRevenueTransactions,
  formatCurrency,
  getAmount,
  getDateRange,
  getRevenueDate,
  isSuccessfulPayment,
  TRANSACTIONS_PAGE_SIZE,
  type DateRangeFilter,
  type TransactionStatusFilter,
} from "@/features/vendor/utils/vendor-earnings.utils";

export function VendorEarningsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
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
    options: { enabled: isAuthorized },
  });

  const { data, isLoading, isError, refetch } = useCustomQuery({
    key: queryKeys.bookings.vendor({
      locationId: vendorLocationId,
      status: "ALL",
    }),
    queryFn: () => getVendorBookings({ locationId: vendorLocationId }),
    options: { enabled: isAuthorized },
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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-full min-w-0 overflow-x-hidden bg-slate-50">
      <PageHeader
        title="Revenue"
        content={
          <div className="min-w-0 py-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
              Revenue
            </h1>
            <p className="truncate text-sm text-slate-500">
              Track paid bookings, payouts, and location-level revenue
              performance.
            </p>
          </div>
        }
        action={
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={locationId}
              onValueChange={(value) => {
                setLocationId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-sm shadow-none sm:w-44">
                <MapPin className="size-4 text-slate-500" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dateRangeFilter}
              onValueChange={(value: DateRangeFilter) => {
                setDateRangeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-sm shadow-none sm:w-40">
                <CalendarDays className="size-4 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAST_7_DAYS">Last 7 days</SelectItem>
                <SelectItem value="LAST_30_DAYS">Last 30 days</SelectItem>
                <SelectItem value="THIS_MONTH">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <main className="mx-auto w-full max-w-7xl space-y-4">
        {isError ? (
          <Card className="border-red-100 bg-white shadow-none">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Unable to load revenue data
                </h2>
                <p className="mt-1 text-sm text-slate-500">Please try again.</p>
              </div>
              <Button onClick={() => void refetch()}>Retry</Button>
            </CardContent>
          </Card>
        ) : null}

        {isLoading || locationsLoading ? (
          <EarningsLoadingState />
        ) : !isError ? (
          <>
            <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total revenue"
                value={formatCurrency(totalRevenue)}
                helper="From successful paid bookings"
                icon={Wallet}
                accent="blue"
              />
              <SummaryCard
                label={
                  dateRangeFilter === "LAST_7_DAYS"
                    ? "This week"
                    : "Selected period"
                }
                value={formatCurrency(periodRevenue)}
                helper={`${paidBookings.length} paid bookings • avg ${formatCurrency(
                  averageRevenue,
                )} / booking`}
                icon={Banknote}
                accent="green"
              />
              <SummaryCard
                label="Pending payments"
                value={formatCurrency(pendingPayments)}
                helper="Awaiting successful payment"
                icon={Clock}
                accent="amber"
              />
              <SummaryCard
                label="Refunds / failed"
                value={formatCurrency(issueAmount)}
                helper={`${failedOrPendingBookings.length} issues • cancelled / failed payments`}
                icon={AlertTriangle}
                accent="red"
              />
            </section>

            <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
              <DailyRevenueCard
                items={dailyRevenue}
                rangeLabel={range.label}
              />
              <RevenueByLocationCard items={revenueByLocation} />
            </section>

            <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
              <TransactionsCard
                transactions={pagedTransactions}
                totalTransactions={filteredTransactions.length}
                currentPage={currentPage}
                totalPages={totalPages}
                search={transactionSearch}
                status={transactionStatus}
                onSearchChange={(value) => {
                  setTransactionSearch(value);
                  setPage(1);
                }}
                onStatusChange={(value) => {
                  setTransactionStatus(value);
                  setPage(1);
                }}
                onPrevious={() =>
                  setPage((value) => Math.max(1, value - 1))
                }
                onNext={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              />
              <div className="space-y-4">
                <PaymentMethodBreakdownCard items={revenueByMethod} />
                <SettlementTimelineCard />
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

