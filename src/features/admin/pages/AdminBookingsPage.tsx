import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CarFront,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import { PageHeader } from "@/common/components/PageHeader";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import useDebounce from "@/common/hooks/useDebounce";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { AdminBookingDetailPanel } from "@/features/bookings/components/AdminBookingDetailPanel";
import { AdminBookingFiltersBar } from "@/features/bookings/components/AdminBookingFiltersBar";
import { AdminBookingStatsCard } from "@/features/bookings/components/AdminBookingStatsCard";
import {
  adminBookingCompactTableColumns,
  adminBookingTableColumns,
} from "@/features/bookings/components/AdminBookingsTable";
import { useAdminBookings } from "@/features/bookings/hooks/useAdminBookings";
import type {
  AdminBooking,
  AdminBookingFilters,
} from "@/features/bookings/types/admin-booking.types";
import {
  filterAdminBookings,
  getAdminBookingCustomerName,
  getAdminBookingStats,
  paginateAdminBookings,
} from "@/features/bookings/utils/admin-booking.utils";

const DEFAULT_FILTERS: AdminBookingFilters = {
  search: "",
  status: "ALL",
  paymentStatus: "ALL",
  date: null,
  page: 1,
  pageSize: 10,
};

export function AdminBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const [filters, setFilters] = useState<AdminBookingFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 300);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminBookings(isAuthorized);

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);
  const stats = useMemo(() => getAdminBookingStats(bookings), [bookings]);
  const listFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );
  const filteredBookings = useMemo(
    () => filterAdminBookings(bookings, listFilters),
    [bookings, listFilters],
  );
  const pageCount = Math.max(
    1,
    Math.ceil(filteredBookings.length / filters.pageSize),
  );
  const currentPage = Math.min(filters.page, pageCount);
  const paginatedBookings = useMemo(
    () =>
      paginateAdminBookings(
        filteredBookings,
        currentPage,
        filters.pageSize,
      ),
    [currentPage, filteredBookings, filters.pageSize],
  );
  const selectedBooking = useMemo(
    () =>
      filteredBookings.find(
        (booking) => booking.bookingId === selectedBookingId,
      ) ?? null,
    [filteredBookings, selectedBookingId],
  );
  const headerContent = useMemo(
    () => (
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold tracking-tight text-foreground">
          Bookings
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          All platform bookings across drivers and vendors
        </p>
      </div>
    ),
    [],
  );

  if (!isAuthorized) {
    return null;
  }

  if (isError) {
    const message = getApiErrorMessage(error);
    const readableMessage = Array.isArray(message) ? message.join(", ") : message;

    return (
      <>
        <PageHeader
          title="Bookings"
          content={headerContent}
        />
        <Card className="rounded-lg border shadow-none">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <RefreshCw className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Could not load bookings.</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                {readableMessage || "Please try again."}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" content={headerContent} />

      {isLoading ? (
        <BookingStatsSkeleton />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminBookingStatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            description="all time"
            icon={CalendarCheck}
            tone="blue"
          />
          <AdminBookingStatsCard
            title="Occupied"
            value={stats.occupied}
            description="currently active"
            icon={CarFront}
            tone="orange"
          />
          <AdminBookingStatsCard
            title="Completed"
            value={stats.completed}
            description="all time"
            icon={CheckCircle2}
            tone="green"
          />
          <AdminBookingStatsCard
            title="Cancelled"
            value={stats.cancelled}
            description="all time"
            icon={XCircle}
            tone="red"
          />
        </section>
      )}

      <SplitDataTable
        columns={adminBookingTableColumns}
        compactColumns={adminBookingCompactTableColumns}
        rows={paginatedBookings}
        getRowId={(booking) => booking.bookingId}
        selectedRowId={selectedBooking ? selectedBookingId : null}
        onRowSelect={(booking: AdminBooking) =>
          setSelectedBookingId((current) =>
            current === booking.bookingId ? null : booking.bookingId,
          )
        }
        onDetailClose={() => setSelectedBookingId(null)}
        detailTitle={
          selectedBooking
            ? getAdminBookingCustomerName(selectedBooking)
            : "Booking details"
        }
        detailPanel={
          <AdminBookingDetailPanel
            booking={selectedBooking}
            onClose={() => setSelectedBookingId(null)}
          />
        }
        isLoading={isLoading}
        emptyState={
          <TableEmptyState
            title={
              bookings.length === 0
                ? "No bookings found"
                : "No bookings match the selected filters"
            }
            description={
              bookings.length === 0
                ? "Platform bookings will appear here after drivers or vendors create them."
                : "Try adjusting the search, status, payment, or date filters."
            }
          />
        }
        toolbar={
          <AdminBookingFiltersBar
            filters={filters}
            resultCount={filteredBookings.length}
            onFiltersChange={(nextFilters) => {
              setFilters(nextFilters);
              setSelectedBookingId(null);
            }}
          />
        }
        pagination={
          <DataTablePagination
            page={currentPage}
            pageSize={filters.pageSize}
            totalItems={filteredBookings.length}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={(page) =>
              setFilters((current) => ({
                ...current,
                page,
              }))
            }
            onPageSizeChange={(pageSize) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                pageSize,
              }))
            }
          />
        }
      />
    </div>
  );
}

function BookingStatsSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="rounded-lg border shadow-none">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="size-11 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
