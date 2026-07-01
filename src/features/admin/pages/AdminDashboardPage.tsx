import {
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/common/components/PageHeader";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { AdminBookingStatusCard } from "@/features/admin/components/AdminBookingStatusCard";
import { AdminDashboardSkeleton } from "@/features/admin/components/AdminDashboardSkeleton";
import { AdminMetricCard } from "@/features/admin/components/AdminMetricCard";
import { AdminQuickActionCard } from "@/features/admin/components/AdminQuickActionCard";
import { AdminRecentBookingsTable } from "@/features/admin/components/AdminRecentBookingsTable";
import { AdminRecentUsersCard } from "@/features/admin/components/AdminRecentUsersCard";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { formatAdminCurrentDate } from "@/features/admin/utils/admin-dashboard.utils";

export function AdminDashboardPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminDashboard(isAuthorized);
  const headerContent = useMemo(
    () => (
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold tracking-tight text-foreground">
          Dashboard
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          Platform overview and key metrics
        </p>
      </div>
    ),
    [],
  );
  const headerAction = useMemo(
    () => (
      <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{formatAdminCurrentDate()}</span>
        <span className="sm:hidden">Today</span>
      </div>
    ),
    [],
  );

  if (!isAuthorized) {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          content={headerContent}
          action={headerAction}
        />
        <AdminDashboardSkeleton />
      </>
    );
  }

  if (isError || !data) {
    const message = getApiErrorMessage(error);
    const readableMessage = Array.isArray(message) ? message.join(", ") : message;

    return (
      <>
        <PageHeader
          title="Dashboard"
          content={headerContent}
          action={headerAction}
        />
        <Card className="rounded-lg border shadow-none">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <RefreshCw className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">
                Could not load admin dashboard.
              </h1>
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

  const { summary } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        content={headerContent}
        action={headerAction}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard
          title="Total Bookings"
          value={summary.totalBookings}
          description="Across all parking locations"
          icon={CalendarCheck}
          tone="blue"
        />
        <AdminMetricCard
          title="Total Vendors"
          value={summary.totalVendors}
          description={`${summary.approvedVendors} approved • ${summary.pendingVendors} pending`}
          icon={Building2}
          tone="green"
        />
        <AdminMetricCard
          title="Total Drivers"
          value={summary.totalDrivers}
          description={`${summary.activeDrivers} active • ${summary.bannedDrivers} banned`}
          icon={Users}
          tone="orange"
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Jump into common admin workflows.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminQuickActionCard
            title="Bookings"
            description="Review platform bookings"
            icon={ClipboardList}
            to="/admin/bookings"
            tone="blue"
          />
          <AdminQuickActionCard
            title="Users"
            description="Manage drivers and vendors"
            icon={Users}
            to="/admin/users"
            tone="green"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminRecentBookingsTable bookings={data.recentBookings} />

        <aside className="space-y-6">
          <AdminBookingStatusCard counts={data.bookingStatusCounts} />
          <AdminRecentUsersCard
            title="Vendors"
            users={data.recentVendors}
            viewAllTo="/admin/users"
            userType="vendor"
          />
          <AdminRecentUsersCard
            title="Drivers"
            users={data.recentDrivers}
            viewAllTo="/admin/users"
            userType="driver"
          />
        </aside>
      </section>
    </div>
  );
}
