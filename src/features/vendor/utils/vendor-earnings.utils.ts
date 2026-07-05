import type { VendorBooking } from "@/features/bookings/services/booking.service";
import {
  formatKathmanduDate,
  formatKathmanduDateInputValue,
} from "@/domain/shared/formatters";
import {
  getBookingId,
  getCustomerName,
  getSlot,
  getSourceLabel,
} from "@/features/vendor/utils/vendor-booking.utils";

export type DateRangeFilter = "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH";
export type TransactionStatusFilter =
  | "ALL"
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED";
export type EarningsMethod = "KHALTI" | "CASH" | "OTHERS";
export type StatAccent = "blue" | "green" | "amber" | "red";

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface DailyRevenueItem {
  date: Date;
  label: string;
  dateLabel: string;
  amount: number;
}

export interface LocationRevenueItem {
  parkingLocationId: string;
  parkingLocationName: string;
  amount: number;
  bookingsCount: number;
  percentOfTotal: number;
}

export interface MethodRevenueItem {
  method: EarningsMethod;
  amount: number;
  successfulPaymentsCount: number;
  percentOfTotal: number;
}

export const TRANSACTIONS_PAGE_SIZE = 5;

export function getDateRange(filter: DateRangeFilter): DateRange {
  const now = new Date();

  if (filter === "THIS_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfDay(start),
      end: endOfDay(now),
      label: `${formatKathmanduDate(start, "-", {
        month: "short",
        day: "numeric",
      })} - ${formatKathmanduDate(now, "-", {
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
    label: `${formatKathmanduDate(start, "-", {
      month: "short",
      day: "numeric",
    })} - ${formatKathmanduDate(now, "-", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`,
  };
}

export function getRevenueDate(booking: VendorBooking) {
  return new Date(booking.paidAt ?? booking.endTime ?? booking.startTime);
}

export function getAmount(booking: VendorBooking) {
  return Number(booking.totalAmount ?? booking.amount ?? 0);
}

export function isSuccessfulPayment(booking: VendorBooking) {
  return booking.paymentStatus === "SUCCESS";
}

export function getMethodGroup(method?: string | null): EarningsMethod {
  if (method === "KHALTI") return "KHALTI";
  if (method === "CASH") return "CASH";
  return "OTHERS";
}

export function getMethodLabel(method: EarningsMethod) {
  if (method === "KHALTI") return "Khalti";
  if (method === "CASH") return "Cash";
  return "Others";
}

export function formatCurrency(amount: number) {
  return `Rs ${Math.round(amount).toLocaleString()}`;
}

export function getDurationLabel(booking: VendorBooking) {
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

export function buildDailyRevenue(
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
      label: formatKathmanduDate(date, "-", { weekday: "short" }),
      dateLabel: formatKathmanduDate(date, "-", {
        month: "short",
        day: "numeric",
      }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function paymentStatusLabel(status?: string | null) {
  if (status === "SUCCESS") return "Paid";
  if (status === "FAILED") return "Failed";
  if (status === "PENDING") return "Pending";
  return "Unknown";
}

export function transactionStatusMatches(
  booking: VendorBooking,
  filter: TransactionStatusFilter,
) {
  if (filter === "ALL") return true;
  if (filter === "PAID") return booking.paymentStatus === "SUCCESS";
  if (filter === "PENDING") return booking.paymentStatus === "PENDING";
  if (filter === "FAILED") return booking.paymentStatus === "FAILED";
  return false;
}

export function buildRevenueByLocation({
  paidBookings,
  periodRevenue,
}: {
  paidBookings: VendorBooking[];
  periodRevenue: number;
}): LocationRevenueItem[] {
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
}

export function buildRevenueByMethod({
  paidBookings,
  periodRevenue,
}: {
  paidBookings: VendorBooking[];
  periodRevenue: number;
}): MethodRevenueItem[] {
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
}

export function filterRevenueTransactions({
  periodBookings,
  transactionSearch,
  transactionStatus,
}: {
  periodBookings: VendorBooking[];
  transactionSearch: string;
  transactionStatus: TransactionStatusFilter;
}) {
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
}

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

function sameDay(left: Date, right: Date) {
  return formatKathmanduDateInputValue(left) === formatKathmanduDateInputValue(right);
}
