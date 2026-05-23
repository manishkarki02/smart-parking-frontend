import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDrivers } from "@/features/users/services/user.service";
import { UserTable } from "@/features/users/components/UserTable";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { PageHeader } from "@/common/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";

export const Route = createFileRoute("/_app/admin/drivers")({
  component: AdminDriversPage,
});

function AdminDriversPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.drivers(),
    queryFn: getDrivers,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers"
        description="Manage driver accounts in the system"
      />

      <Card className="rounded-none sm:rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <UserTable users={drivers} />
        )}
      </Card>
    </div>
  );
}
