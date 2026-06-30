import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DataTable, { type ColumnDef } from "@/common/components/DataTable";
import { PageHeader } from "@/common/components/PageHeader";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/config/query-keys";
import {
  banUser,
  deleteUser,
  getAdminDrivers,
  unbanUser,
  type AdminUser,
} from "@/features/admin/services/admin.service";

export const Route = createFileRoute("/_app/admin/drivers")({
  component: AdminDriversPage,
});

function getDriverStatus(driver: AdminUser): string {
  if (driver.status) {
    return driver.status;
  }
  return driver.banned ? "BANNED" : "ACTIVE";
}

function AdminDriversPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);

  const { data, isLoading } = useCustomQuery({
    key: queryKeys.admin.drivers({ search, page }),
    queryFn: () => getAdminDrivers({ search, page }),
    options: {
      enabled: isAuthorized,
    },
  });

  const invalidateDrivers = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.drivers() });
  };

  const banMutation = useCustomMutation({
    api: banUser,
    onSuccess: () => {
      invalidateDrivers();
      toast.success("Driver banned successfully");
    },
  });

  const unbanMutation = useCustomMutation({
    api: unbanUser,
    onSuccess: () => {
      invalidateDrivers();
      toast.success("Driver unbanned successfully");
    },
  });

  const deleteMutation = useCustomMutation({
    api: deleteUser,
    onSuccess: () => {
      setDeletingDriverId(null);
      invalidateDrivers();
      toast.success("Driver deleted successfully");
    },
  });

  const columns: ColumnDef<AdminUser>[] = [
    {
      key: "id",
      header: "Driver ID",
      className: "font-mono",
      cell: (driver) => String(driver.id).slice(0, 8),
    },
    {
      key: "name",
      header: "Full name",
      cell: (driver) => driver.name,
    },
    {
      key: "email",
      header: "Email",
      cell: (driver) => driver.email,
    },
    {
      key: "phone",
      header: "Phone",
      cell: (driver) => driver.phone,
    },
    {
      key: "status",
      header: "Status",
      cell: (driver) => <Badge variant="outline">{getDriverStatus(driver)}</Badge>,
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <PageHeader title="Drivers" />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No drivers found"
        rowActions={(driver) => {
          const isBanned = getDriverStatus(driver).toUpperCase() === "BANNED";

          return (
            <>
              {isBanned ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  disabled={unbanMutation.isPending}
                  onClick={() => unbanMutation.mutate(driver.id)}
                  aria-label="Unban driver"
                  title="Unban driver"
                >
                  <ShieldCheck />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  disabled={banMutation.isPending}
                  onClick={() => banMutation.mutate(driver.id)}
                  aria-label="Ban driver"
                  title="Ban driver"
                >
                  <ShieldX />
                </Button>
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                onClick={() => setDeletingDriverId(String(driver.id))}
                aria-label="Delete driver"
                title="Delete driver"
              >
                <Trash2 />
              </Button>
            </>
          );
        }}
      />

      <ConfirmDialog
        open={deletingDriverId !== null}
        onOpenChange={(open) => !open && setDeletingDriverId(null)}
        title="Delete this driver?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingDriverId) {
            deleteMutation.mutate(deletingDriverId);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
