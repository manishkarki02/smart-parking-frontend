import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/features/admin/services/admin.service";
import { StatsCard } from "@/features/admin/components/StatsCard";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { CalendarCheck, Building2, Users } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: getDashboard,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of the Smart Parking system
        </p>
      </div>

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
    </div>
  );
}
