import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminBookingFilters,
  AdminBookingStatusFilter,
  AdminPaymentStatusFilter,
} from "@/features/bookings/types/admin-booking.types";
import {
  ADMIN_BOOKING_STATUS_OPTIONS,
  ADMIN_PAYMENT_STATUS_OPTIONS,
  formatAdminBookingResultCount,
} from "@/features/bookings/utils/admin-booking.utils";

type AdminBookingFiltersBarProps = {
  filters: AdminBookingFilters;
  resultCount: number;
  onFiltersChange: (filters: AdminBookingFilters) => void;
};

export function AdminBookingFiltersBar({
  filters,
  resultCount,
  onFiltersChange,
}: AdminBookingFiltersBarProps) {
  const hasDate = Boolean(filters.date);

  function updateFilters(nextFilters: Partial<AdminBookingFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
      page: 1,
    });
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_210px_170px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder="Search bookings..."
            aria-label="Search bookings"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value: AdminBookingStatusFilter) =>
            updateFilters({ status: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_BOOKING_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.paymentStatus}
          onValueChange={(value: AdminPaymentStatusFilter) =>
            updateFilters({ paymentStatus: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Payment Status" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_PAYMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.date ?? ""}
            onChange={(event) =>
              updateFilters({ date: event.target.value || null })
            }
            aria-label="Filter bookings by date"
          />
          {hasDate ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => updateFilters({ date: null })}
              aria-label="Clear date filter"
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        {formatAdminBookingResultCount(resultCount)}
      </div>
    </div>
  );
}
