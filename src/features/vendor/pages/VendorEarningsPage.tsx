import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  Clock,
  MapPin,
  Wallet,
} from "lucide-react";
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
import {
  DailyRevenueCard,
  EarningsLoadingState,
  PaymentMethodBreakdownCard,
  RevenueByLocationCard,
  SettlementTimelineCard,
  SummaryCard,
  TransactionsCard,
} from "@/features/vendor/components/earnings/VendorEarningsSections";
import { useVendorEarningsPageState } from "@/features/vendor/hooks/useVendorEarningsPageState";
import {
  formatCurrency,
  type DateRangeFilter,
} from "@/features/vendor/utils/vendor-earnings.utils";

export function VendorEarningsPage() {
  const page = useVendorEarningsPageState();

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
              value={page.locationId}
              onValueChange={page.selectLocation}
            >
              <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-sm shadow-none sm:w-44">
                <MapPin className="size-4 text-slate-500" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Locations</SelectItem>
                {page.locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={page.dateRangeFilter}
              onValueChange={(value: DateRangeFilter) =>
                page.selectDateRange(value)
              }
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
        {page.isError ? (
          <Card className="border-red-100 bg-white shadow-none">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Unable to load revenue data
                </h2>
                <p className="mt-1 text-sm text-slate-500">Please try again.</p>
              </div>
              <Button onClick={() => void page.refetch()}>Retry</Button>
            </CardContent>
          </Card>
        ) : null}

        {page.isLoading ? (
          <EarningsLoadingState />
        ) : !page.isError ? (
          <>
            <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total revenue"
                value={formatCurrency(page.totalRevenue)}
                helper="From successful paid bookings"
                icon={Wallet}
                accent="blue"
              />
              <SummaryCard
                label={
                  page.dateRangeFilter === "LAST_7_DAYS"
                    ? "This week"
                    : "Selected period"
                }
                value={formatCurrency(page.periodRevenue)}
                helper={`${page.paidBookings.length} paid bookings • avg ${formatCurrency(
                  page.averageRevenue,
                )} / booking`}
                icon={Banknote}
                accent="green"
              />
              <SummaryCard
                label="Pending payments"
                value={formatCurrency(page.pendingPayments)}
                helper="Awaiting successful payment"
                icon={Clock}
                accent="amber"
              />
              <SummaryCard
                label="Refunds / failed"
                value={formatCurrency(page.issueAmount)}
                helper={`${page.failedOrPendingBookings.length} issues • cancelled / failed payments`}
                icon={AlertTriangle}
                accent="red"
              />
            </section>

            <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
              <DailyRevenueCard
                items={page.dailyRevenue}
                rangeLabel={page.range.label}
              />
              <RevenueByLocationCard items={page.revenueByLocation} />
            </section>

            <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
              <TransactionsCard
                transactions={page.pagedTransactions}
                totalTransactions={page.filteredTransactions.length}
                currentPage={page.currentPage}
                totalPages={page.totalPages}
                search={page.transactionSearch}
                status={page.transactionStatus}
                onSearchChange={page.searchTransactions}
                onStatusChange={page.filterTransactionStatus}
                onPrevious={page.previousPage}
                onNext={page.nextPage}
              />
              <div className="space-y-4">
                <PaymentMethodBreakdownCard items={page.revenueByMethod} />
                <SettlementTimelineCard />
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
