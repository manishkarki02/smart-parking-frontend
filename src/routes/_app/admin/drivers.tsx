import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Search, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTablePagination,
  SplitDataTable,
  SplitDetailPanel,
  TableEmptyState,
  TableToolbar,
  type DataTableColumn,
} from "@/common";
import { PageHeader } from "@/common/components/PageHeader";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function InfoItem({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

function AdminDriversPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);

  const { data, isLoading, isError } = useCustomQuery({
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

  const drivers = useMemo(() => data?.data ?? [], [data?.data]);
  const selectedDriver =
    drivers.find((driver) => String(driver.id) === selectedDriverId) ?? null;

  const renderDriverActions = (driver: AdminUser) => {
    const isBanned = getDriverStatus(driver).toUpperCase() === "BANNED";

    return (
      <div data-row-action="true" className="flex items-center gap-2">
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
      </div>
    );
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "id",
      header: "Driver ID",
      className: "font-mono",
      cell: (driver) => String(driver.id).slice(0, 8),
      compact: true,
    },
    {
      id: "name",
      header: "Full name",
      cell: (driver) => driver.name,
      compact: true,
    },
    {
      id: "email",
      header: "Email",
      cell: (driver) => driver.email,
      compact: true,
    },
    {
      id: "phone",
      header: "Phone",
      cell: (driver) => driver.phone,
    },
    {
      id: "status",
      header: "Status",
      cell: (driver) => <Badge variant="outline">{getDriverStatus(driver)}</Badge>,
      compact: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: renderDriverActions,
      compact: true,
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <PageHeader title="Drivers" />
      <SplitDataTable
        columns={columns}
        rows={drivers}
        getRowId={(driver) => String(driver.id)}
        selectedRowId={selectedDriverId}
        onRowSelect={(driver) =>
          setSelectedDriverId((current) =>
            current === String(driver.id) ? null : String(driver.id),
          )
        }
        onDetailClose={() => setSelectedDriverId(null)}
        detailTitle={selectedDriver?.name ?? "Driver details"}
        detailPanel={
          selectedDriver ? (
            <SplitDetailPanel
              title={selectedDriver.name}
              subtitle={selectedDriver.email}
              onClose={() => setSelectedDriverId(null)}
            >
              <div className="space-y-4">
                <section className="grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Name" value={selectedDriver.name} />
                  <InfoItem label="Email" value={selectedDriver.email} />
                  <InfoItem label="Phone" value={selectedDriver.phone} />
                  <InfoItem
                    label="Status"
                    value={<Badge variant="outline">{getDriverStatus(selectedDriver)}</Badge>}
                  />
                  <InfoItem label="Driver ID" value={String(selectedDriver.id)} />
                  <InfoItem label="Role" value={selectedDriver.role} />
                </section>
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {renderDriverActions(selectedDriver)}
                </div>
              </div>
            </SplitDetailPanel>
          ) : null
        }
        isLoading={isLoading}
        error={isError}
        emptyState={
          <TableEmptyState
            title="No drivers found"
            description="Try adjusting your search to find a driver."
          />
        }
        toolbar={
          <TableToolbar
            left={
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                    setSelectedDriverId(null);
                  }}
                  placeholder="Search drivers..."
                  className="pl-9"
                />
              </div>
            }
          />
        }
        pagination={
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 1}
            pageSizeOptions={[10]}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        }
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
