import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";
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
  approveVendor,
  deleteVendor,
  getAdminVendors,
  type AdminUser,
} from "@/features/admin/services/admin.service";

export const Route = createFileRoute("/_app/admin/vendors")({
  component: AdminVendorsPage,
});

function getVendorStatus(vendor: AdminUser): string {
  if (vendor.status) {
    return vendor.status;
  }
  if (vendor.approved === false) {
    return "PENDING";
  }
  return "APPROVED";
}

function canApproveVendor(vendor: AdminUser): boolean {
  const status = getVendorStatus(vendor).toUpperCase();
  return status === "PENDING" || status === "UNAPPROVED";
}

function AdminVendorsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);

  const vendorsKey = queryKeys.admin.vendors({ search, page });
  const { data, isLoading } = useCustomQuery({
    key: vendorsKey,
    queryFn: () => getAdminVendors({ search, page }),
    options: {
      enabled: isAuthorized,
    },
  });

  const approveMutation = useCustomMutation({
    api: approveVendor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors() });
      toast.success("Vendor approved successfully");
    },
  });

  const deleteMutation = useCustomMutation({
    api: deleteVendor,
    onSuccess: () => {
      setDeletingVendorId(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors() });
      toast.success("Vendor deleted successfully");
    },
  });

  const columns: ColumnDef<AdminUser>[] = [
    {
      key: "id",
      header: "Vendor ID",
      className: "font-mono",
      cell: (vendor) => String(vendor.id).slice(0, 8),
    },
    {
      key: "businessName",
      header: "Business name",
      cell: (vendor) => vendor.businessName ?? vendor.name,
    },
    {
      key: "email",
      header: "Email",
      cell: (vendor) => vendor.email,
    },
    {
      key: "phone",
      header: "Phone",
      cell: (vendor) => vendor.phone,
    },
    {
      key: "status",
      header: "Status",
      cell: (vendor) => <Badge variant="outline">{getVendorStatus(vendor)}</Badge>,
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <PageHeader title="Vendors" />
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
        emptyMessage="No vendors found"
        rowActions={(vendor) => (
          <>
            {canApproveVendor(vendor) && (
              <Button
                type="button"
                size="icon-sm"
                onClick={() => approveMutation.mutate(vendor.id)}
                disabled={approveMutation.isPending}
                aria-label="Approve vendor"
                title="Approve vendor"
              >
                <Check />
              </Button>
            )}
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={() => setDeletingVendorId(String(vendor.id))}
              aria-label="Delete vendor"
              title="Delete vendor"
            >
              <Trash2 />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={deletingVendorId !== null}
        onOpenChange={(open) => !open && setDeletingVendorId(null)}
        title="Delete this vendor?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingVendorId) {
            deleteMutation.mutate(deletingVendorId);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
