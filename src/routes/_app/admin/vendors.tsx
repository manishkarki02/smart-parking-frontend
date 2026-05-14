import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { getVendors } from "@/features/admin/services/admin.service";
import { UserTable } from "@/features/admin/components/UserTable";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { PageHeader } from "@/common/components/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/admin/vendors")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminVendorsPage,
});

function AdminVendorsPage() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.vendors(),
    queryFn: getVendors,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage vendor accounts in the system"
      />

      <Card className="rounded-none sm:rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <UserTable users={vendors} />
        )}
      </Card>
    </div>
  );
}
