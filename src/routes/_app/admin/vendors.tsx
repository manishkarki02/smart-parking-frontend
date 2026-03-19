import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVendors } from "@/features/admin/services/admin.service";
import { UserTable } from "@/features/admin/components/UserTable";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";

export const Route = createFileRoute("/_app/admin/vendors")({
  beforeLoad: () => {
    // Role guard disabled for UI testing
  },
  component: AdminVendorsPage,
});

function AdminVendorsPage() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.vendors,
    queryFn: getVendors,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendors</h1>
        <p className="text-muted-foreground mt-1">
          All registered parking vendors
        </p>
      </div>

      {isLoading ? <LoadingSpinner /> : <UserTable users={vendors} />}
    </div>
  );
}
