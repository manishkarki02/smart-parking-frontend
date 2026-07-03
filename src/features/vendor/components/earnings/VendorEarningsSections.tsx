import type { ComponentType } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RotateCcw,
  Search,
} from "lucide-react";
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
import type { VendorBooking } from "@/features/bookings/services/booking.service";
import {
  formatDate,
  formatTime,
  getBookingId,
  getCustomerName,
  getSlot,
} from "@/features/vendor/utils/vendor-booking.utils";
import {
  formatCurrency,
  getAmount,
  getDurationLabel,
  getMethodGroup,
  getMethodLabel,
  paymentStatusLabel,
  type DailyRevenueItem,
  type EarningsMethod,
  type LocationRevenueItem,
  type MethodRevenueItem,
  type StatAccent,
  type TransactionStatusFilter,
} from "@/features/vendor/utils/vendor-earnings.utils";
import { cn } from "@/lib/utils";

const statAccentStyles: Record<StatAccent, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
};

export function SummaryCard({
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

export function DailyRevenueCard({
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

export function RevenueByLocationCard({ items }: { items: LocationRevenueItem[] }) {
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

export function TransactionsCard({
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

export function PaymentMethodBreakdownCard({ items }: { items: MethodRevenueItem[] }) {
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

export function SettlementTimelineCard() {
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

export function EarningsLoadingState() {
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
