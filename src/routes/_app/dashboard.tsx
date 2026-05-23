import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/features/admin/services/admin.service";
import { StatsCard } from "@/features/admin/components/StatsCard";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { CalendarCheck, Building2, Users } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";

export const Route = createFileRoute("/_app/dashboard")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: getDashboard,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of the Smart Parking system"
      />

      <Card className="rounded-none sm:rounded-lg p-6 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Bookings"
              value={stats?.totalBookings ?? 0}
              icon={<CalendarCheck className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Total Vendors"
              value={stats?.totalVendors ?? 0}
              icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Total Drivers"
              value={stats?.totalDrivers ?? 0}
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
