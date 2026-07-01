import { Search } from "lucide-react";
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
  AdminUsersFilters,
  AdminUserStatusFilter,
} from "@/features/admin/types/admin-user.types";
import {
  ADMIN_USER_ROLE_OPTIONS,
  ADMIN_USER_STATUS_OPTIONS,
  formatAdminUsersCount,
} from "@/features/admin/utils/admin-user.utils";

type AdminUsersFilterBarProps = {
  filters: AdminUsersFilters;
  totalUsers: number;
  onFiltersChange: (filters: AdminUsersFilters) => void;
};

export function AdminUsersFilterBar({
  filters,
  totalUsers,
  onFiltersChange,
}: AdminUsersFilterBarProps) {
  function updateFilters(nextFilters: Partial<AdminUsersFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
    });
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border bg-card p-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(220px,1fr)_190px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder="Search by name, email or phone..."
            aria-label="Search users"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value: AdminUserStatusFilter) =>
            updateFilters({ status: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_USER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-lg border bg-muted/40 p-1">
          {ADMIN_USER_ROLE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={filters.role === option.value ? "default" : "ghost"}
              onClick={() => updateFilters({ role: option.value })}
              className="min-w-20"
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="shrink-0 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {formatAdminUsersCount(totalUsers)}
        </div>
      </div>
    </div>
  );
}
