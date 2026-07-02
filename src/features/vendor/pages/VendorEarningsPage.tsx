import { useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  RotateCcw,
  Search,
  Wallet,
} from "lucide-react";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { PageHeader } from "@/common/components/PageHeader";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { getMyParkingLocations } from "@/features/vendor/services/vendor.service";
import {
  formatDate,
  formatTime,
  getBookingId,
  getCustomerName,
  getSlot,
  getSourceLabel,
} from "@/features/vendor/utils/vendor-booking.utils";
import { cn } from "@/lib/utils";

type DateRangeFilter = "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH";
type TransactionStatusFilter =
  | "ALL"
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED";
type EarningsMethod = "KHALTI" | "CASH" | "OTHERS";
type StatAccent = "blue" | "green" | "amber" | "red";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface DailyRevenueItem {
  date: Date;
  label: string;
  dateLabel: string;
  amount: number;
}

interface LocationRevenueItem {
  parkingLocationId: string;
  parkingLocationName: string;
  amount: number;
  bookingsCount: number;
  percentOfTotal: number;
}

interface MethodRevenueItem {
  method: EarningsMethod;
  amount: number;
  successfulPaymentsCount: number;
  percentOfTotal: number;
}

const statAccentStyles: Record<StatAccent, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
};

const TRANSACTIONS_PAGE_SIZE = 5;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getDateRange(filter: DateRangeFilter): DateRange {
  const now = new Date();

  if (filter === "THIS_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfDay(start),
      end: endOfDay(now),
      label: `${start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })} - ${now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    };
  }

  const days = filter === "LAST_30_DAYS" ? 30 : 7;
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));

  return {
    start: startOfDay(start),
    end: endOfDay(now),
    label: `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} - ${now.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`,
  };
}

function getRevenueDate(booking: VendorBooking) {
  return new Date(booking.paidAt ?? booking.endTime ?? booking.startTime);
}

function getAmount(booking: VendorBooking) {
  return Number(booking.totalAmount ?? booking.amount ?? 0);
}

function isSuccessfulPayment(booking: VendorBooking) {
  return booking.paymentStatus === "SUCCESS";
}

function getMethodGroup(method?: string | null): EarningsMethod {
  if (method === "KHALTI") return "KHALTI";
  if (method === "CASH") return "CASH";
  return "OTHERS";
}

function getMethodLabel(method: EarningsMethod) {
  if (method === "KHALTI") return "Khalti";
  if (method === "CASH") return "Cash";
  return "Others";
}

function formatCurrency(amount: number) {
  return `Rs ${Math.round(amount).toLocaleString()}`;
}

function getDurationLabel(booking: VendorBooking) {
  if (!booking.endTime) return "active";
  const minutes = Math.max(
    0,
    Math.round(
      (new Date(booking.endTime).getTime() -
        new Date(booking.startTime).getTime()) /
        60_000,
    ),
  );
  const hours = Math.max(1, Math.ceil(minutes / 60));
  return `${hours} hr${hours === 1 ? "" : "s"}`;
}

function sameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

function buildDailyRevenue(
  paidBookings: VendorBooking[],
  range: DateRange,
): DailyRevenueItem[] {
  const days: DailyRevenueItem[] = [];
  const cursor = new Date(range.start);

  while (cursor <= range.end) {
    const date = new Date(cursor);
    const amount = paidBookings
      .filter((booking) => sameDay(getRevenueDate(booking), date))
      .reduce((sum, booking) => sum + getAmount(booking), 0);

    days.push({
      date,
      amount,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      dateLabel: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function paymentStatusLabel(status?: string | null) {
  if (status === "SUCCESS") return "Paid";
  if (status === "FAILED") return "Failed";
  if (status === "PENDING") return "Pending";
  return "Unknown";
}

function transactionStatusMatches(
  booking: VendorBooking,
  filter: TransactionStatusFilter,
) {
  if (filter === "ALL") return true;
  if (filter === "PAID") return booking.paymentStatus === "SUCCESS";
  if (filter === "PENDING") return booking.paymentStatus === "PENDING";
  if (filter === "FAILED") return booking.paymentStatus === "FAILED";
  return false;
}

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

  const revenueByLocation = useMemo<LocationRevenueItem[]>(() => {
    const grouped = new Map<string, LocationRevenueItem>();
    paidBookings.forEach((booking) => {
      const id = booking.parkingLocationId;
      const existing = grouped.get(id) ?? {
        parkingLocationId: id,
        parkingLocationName: booking.parkingLocationName ?? "Unknown location",
        amount: 0,
        bookingsCount: 0,
        percentOfTotal: 0,
      };
      existing.amount += getAmount(booking);
      existing.bookingsCount += 1;
      grouped.set(id, existing);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        percentOfTotal:
          periodRevenue > 0 ? Math.round((item.amount / periodRevenue) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [paidBookings, periodRevenue]);

  const revenueByMethod = useMemo<MethodRevenueItem[]>(() => {
    const methods: MethodRevenueItem[] = [
      { method: "KHALTI", amount: 0, successfulPaymentsCount: 0, percentOfTotal: 0 },
      { method: "CASH", amount: 0, successfulPaymentsCount: 0, percentOfTotal: 0 },
      { method: "OTHERS", amount: 0, successfulPaymentsCount: 0, percentOfTotal: 0 },
    ];

    paidBookings.forEach((booking) => {
      const method = getMethodGroup(booking.paymentMethod);
      const item = methods.find((entry) => entry.method === method);
      if (!item) return;
      item.amount += getAmount(booking);
      item.successfulPaymentsCount += 1;
    });

    return methods.map((item) => ({
      ...item,
      percentOfTotal:
        periodRevenue > 0 ? Math.round((item.amount / periodRevenue) * 100) : 0,
    }));
  }, [paidBookings, periodRevenue]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = transactionSearch.trim().toLowerCase();

    return periodBookings.filter((booking) => {
      const haystack = [
        getBookingId(booking),
        getCustomerName(booking),
        booking.parkingLocationName,
        getSlot(booking),
        getSourceLabel(booking),
        booking.paymentMethod ?? "",
        booking.paymentStatus ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        transactionStatusMatches(booking, transactionStatus)
      );
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

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  accent: StatAccent;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="flex min-h-28 justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1.5 text-xs leading-4 text-slate-500">{helper}</p>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            statAccentStyles[accent],
          )}
        >
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

function DailyRevenueCard({
  items,
  rangeLabel,
}: {
  items: DailyRevenueItem[];
  rangeLabel: string;
}) {
  const maxAmount = Math.max(...items.map((item) => item.amount), 1);

  return (
    <Card className="min-w-0 overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-950">Daily revenue</h3>
            <p className="mt-1 text-sm leading-5 text-slate-500">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-200" />
              Past days
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-600" />
              Latest
            </span>
          </div>
        </div>
        {items.every((item) => item.amount === 0) ? (
          <div className="flex h-52 items-center justify-center p-5 text-center">
            <div>
              <p className="font-semibold text-slate-950">
                No daily revenue yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Paid bookings for the selected period will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-52 min-w-0 items-end gap-3 overflow-x-auto px-5 pb-5 pt-6">
            {items.map((item, index) => {
              const height = Math.max(16, (item.amount / maxAmount) * 105);
              const isLatest = index === items.length - 1;
              return (
                <div
                  key={item.date.toISOString()}
                  className="flex min-w-16 flex-1 flex-col items-center"
                >
                  <p className="mb-3 text-xs font-semibold text-slate-500">
                    {formatCurrency(item.amount)}
                  </p>
                  <div
                    className={cn(
                      "w-full max-w-20 rounded-t-md",
                      isLatest
                        ? "bg-blue-600"
                        : "bg-gradient-to-b from-blue-100 to-blue-200",
                    )}
                    style={{ height }}
                  />
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.dateLabel}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueByLocationCard({ items }: { items: LocationRevenueItem[] }) {
  return (
    <Card className="min-w-0 self-start overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-base font-bold text-slate-950">By location</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Revenue contribution per parking lot
          </p>
        </div>
        {items.length === 0 ? (
          <EmptyPanel
            title="No location revenue"
            message="Paid bookings by location will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {items.map((item, index) => (
              <div key={item.parkingLocationId} className="space-y-2.5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 truncate text-sm font-bold text-slate-950">
                    {item.parkingLocationName}
                  </p>
                  <p className="shrink-0 text-base font-bold text-slate-950">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-blue-600" : "bg-green-600",
                    )}
                    style={{ width: `${item.percentOfTotal}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>
                    {item.bookingsCount} bookings • {item.percentOfTotal}% of
                    total
                  </span>
                  {index === 0 ? (
                    <Badge className="border-0 bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-50">
                      Best performer
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionsCard({
  transactions,
  totalTransactions,
  currentPage,
  totalPages,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onPrevious,
  onNext,
}: {
  transactions: VendorBooking[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  search: string;
  status: TransactionStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TransactionStatusFilter) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="p-0">
        <div className="space-y-3 p-4">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              Recent revenue transactions
            </h3>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Paid bookings, pending settlements, and refund events
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search booking, customer, location..."
                className="h-9 border-slate-200 pl-9 text-sm shadow-none"
              />
            </div>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 border-slate-200 text-sm shadow-none sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUND_PENDING">Refund pending</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader className="bg-slate-100/80">
              <TableRow className="hover:bg-transparent">
                {["Booking", "Customer", "Location", "Method", "Amount", "Payout / Status"].map(
                  (header) => (
                    <TableHead
                      key={header}
                      className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {header}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center">
                    <p className="font-semibold text-slate-950">
                      No revenue transactions found
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Paid bookings for the selected period will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((booking) => (
                  <TableRow key={getBookingId(booking)} className="border-slate-200">
                    <TableCell className="px-4 py-3">
                      <p className="font-mono text-sm font-bold text-slate-600">
                        #{getBookingId(booking).slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {getSlot(booking)} • {getDurationLabel(booking)}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-950">
                        {getCustomerName(booking)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.walkIn ? "On-site booking" : "App driver"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-44 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {booking.parkingLocationName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(booking.paidAt ?? booking.startTime)},{" "}
                        {formatTime(booking.paidAt ?? booking.startTime)}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <MethodBadge method={getMethodGroup(booking.paymentMethod)} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-bold text-slate-950">
                      {formatCurrency(getAmount(booking))}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Showing {transactions.length} of {totalTransactions} transactions</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={onPrevious}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button type="button" size="sm" className="w-9 px-0">
              {currentPage}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={onNext}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentMethodBreakdownCard({ items }: { items: MethodRevenueItem[] }) {
  return (
    <Card className="min-w-0 self-start overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-base font-bold text-slate-950">
            By payment method
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Collection split for the selected period
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <div
              key={item.method}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <CreditCard className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {getMethodLabel(item.method)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.successfulPaymentsCount} successful payments
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-950">
                  {formatCurrency(item.amount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.percentOfTotal}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettlementTimelineCard() {
  return (
    <Card className="min-w-0 self-start overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-base font-bold text-slate-950">
            Settlement timeline
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Latest payout and adjustment activity
          </p>
        </div>
        <div className="p-4">
          <div className="rounded-lg border border-dashed border-slate-200 p-5 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <RotateCcw className="size-4" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-950">
              No settlement activity yet
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Settlement activity will appear here when payouts or refund
              adjustments are available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MethodBadge({ method }: { method: EarningsMethod }) {
  return (
    <Badge
      className={cn(
        "border px-2.5 py-1 text-xs font-bold shadow-none",
        method === "KHALTI" &&
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50",
        method === "CASH" &&
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
        method === "OTHERS" &&
          "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
      )}
    >
      {getMethodLabel(method)}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      className={cn(
        "border px-2.5 py-1 text-xs font-bold shadow-none",
        status === "SUCCESS" &&
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
        status === "PENDING" &&
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
        status === "FAILED" &&
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
      )}
    >
      {paymentStatusLabel(status)}
    </Badge>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center p-6 text-center">
      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function EarningsLoadingState() {
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-slate-200 bg-white shadow-none">
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-6 p-5">
            <Skeleton className="h-5 w-36" />
            <div className="flex h-72 items-end gap-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-full rounded-t-lg"
                  style={{ height: 80 + index * 18 }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-5 p-5">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
