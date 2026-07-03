import { Filter, Search } from "lucide-react";
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
  VendorBookingPaymentMethodFilter,
  VendorBookingStatusFilter,
} from "@/features/vendor/types/vendor-booking.types";

export function VendorBookingsToolbar({
  search,
  statusFilter,
  paymentMethodFilter,
  onSearchChange,
  onStatusFilterChange,
  onPaymentMethodFilterChange,
  onResetFilters,
}: {
  search: string;
  statusFilter: VendorBookingStatusFilter;
  paymentMethodFilter: VendorBookingPaymentMethodFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: VendorBookingStatusFilter) => void;
  onPaymentMethodFilterChange: (value: VendorBookingPaymentMethodFilter) => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="shrink-0 text-base font-semibold text-slate-950">
          All Bookings
        </h2>
        <div className="relative min-w-0 sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search customer, slot, vehicle..."
            className="h-9 border-slate-200 pl-9 text-sm shadow-none"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-9 w-full border-slate-200 text-sm shadow-none sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="BOOKED">Booked</SelectItem>
            <SelectItem value="CHECKED_IN">Checked in</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="PAYMENT_PENDING">Payment pending</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentMethodFilter}
          onValueChange={onPaymentMethodFilterChange}
        >
          <SelectTrigger className="h-9 w-full border-slate-200 text-sm shadow-none sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Payment method</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="KHALTI">Khalti</SelectItem>
            <SelectItem value="ESEWA">Esewa</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-9 border-slate-200 shadow-none"
          onClick={onResetFilters}
        >
          <Filter className="size-4" />
          Filter
        </Button>
      </div>
    </div>
  );
}
