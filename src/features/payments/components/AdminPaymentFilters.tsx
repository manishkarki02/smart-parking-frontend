import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type PaymentMethodFilter,
  type PaymentStatusFilter,
} from "@/features/payments/utils/payment.utils";

export type AdminPaymentFilterState = {
  search: string;
  status: PaymentStatusFilter;
  method: PaymentMethodFilter;
  fromDate: string;
  toDate: string;
};

type AdminPaymentFiltersProps = {
  filters: AdminPaymentFilterState;
  onFiltersChange: (filters: AdminPaymentFilterState) => void;
};

export function AdminPaymentFilters({
  filters,
  onFiltersChange,
}: AdminPaymentFiltersProps) {
  function updateFilters(nextFilters: Partial<AdminPaymentFilterState>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_170px_160px_160px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => updateFilters({ search: event.target.value })}
          placeholder="Search by ID, booking, customer, vehicle..."
          aria-label="Search payments"
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value: PaymentStatusFilter) =>
          updateFilters({ status: value })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.method}
        onValueChange={(value: PaymentMethodFilter) =>
          updateFilters({ method: value })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Methods" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filters.fromDate}
        onChange={(event) => updateFilters({ fromDate: event.target.value })}
        aria-label="Filter payments from date"
      />
      <Input
        type="date"
        value={filters.toDate}
        onChange={(event) => updateFilters({ toDate: event.target.value })}
        aria-label="Filter payments to date"
      />
    </div>
  );
}
