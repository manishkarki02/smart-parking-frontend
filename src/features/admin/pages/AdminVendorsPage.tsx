import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTablePagination,
  InfoItem,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/config/query-keys";
import {
  approveVendor,
  deleteVendor,
  getAdminVendors,
  type AdminUser,
} from "@/features/admin/services/admin.service";

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

export function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);

  const vendorsKey = queryKeys.admin.vendors({ search, page });
  const { data, isLoading, isError } = useCustomQuery({
    key: vendorsKey,
    queryFn: () => getAdminVendors({ search, page }),
  });

  const approveMutation = useCustomMutation({
    api: approveVendor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendorsRoot() });
      toast.success("Vendor approved successfully");
    },
  });

  const deleteMutation = useCustomMutation({
    api: deleteVendor,
    onSuccess: () => {
      setDeletingVendorId(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendorsRoot() });
      toast.success("Vendor deleted successfully");
    },
  });

  const vendors = useMemo(() => data?.data ?? [], [data?.data]);
  const selectedVendor =
    vendors.find((vendor) => String(vendor.id) === selectedVendorId) ?? null;

  const renderVendorActions = (vendor: AdminUser) => (
    <div data-row-action="true" className="flex items-center gap-2">
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
    </div>
  );

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "id",
      header: "Vendor ID",
      className: "font-mono",
      cell: (vendor) => String(vendor.id).slice(0, 8),
      compact: true,
    },
    {
      id: "businessName",
      header: "Business name",
      cell: (vendor) => vendor.businessName ?? vendor.name,
      compact: true,
    },
    {
      id: "email",
      header: "Email",
      cell: (vendor) => vendor.email,
      compact: true,
    },
    {
      id: "phone",
      header: "Phone",
      cell: (vendor) => vendor.phone,
    },
    {
      id: "status",
      header: "Status",
      cell: (vendor) => <Badge variant="outline">{getVendorStatus(vendor)}</Badge>,
      compact: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: renderVendorActions,
      compact: true,
    },
  ];

  return (
    <>
      <PageHeader title="Vendors" />
      <SplitDataTable
        columns={columns}
        rows={vendors}
        getRowId={(vendor) => String(vendor.id)}
        selectedRowId={selectedVendorId}
        onRowSelect={(vendor) =>
          setSelectedVendorId((current) =>
            current === String(vendor.id) ? null : String(vendor.id),
          )
        }
        onDetailClose={() => setSelectedVendorId(null)}
        detailTitle={selectedVendor?.businessName ?? selectedVendor?.name ?? "Vendor details"}
        detailPanel={
          selectedVendor ? (
            <SplitDetailPanel
              title={selectedVendor.businessName ?? selectedVendor.name}
              subtitle={selectedVendor.email}
              onClose={() => setSelectedVendorId(null)}
            >
              <div className="space-y-4">
                <section className="grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Name" value={selectedVendor.name} />
                  <InfoItem label="Business" value={selectedVendor.businessName} />
                  <InfoItem label="Email" value={selectedVendor.email} />
                  <InfoItem label="Phone" value={selectedVendor.phone} />
                  <InfoItem
                    label="Status"
                    value={<Badge variant="outline">{getVendorStatus(selectedVendor)}</Badge>}
                  />
                  <InfoItem label="Vendor ID" value={String(selectedVendor.id)} />
                </section>
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {renderVendorActions(selectedVendor)}
                </div>
              </div>
            </SplitDetailPanel>
          ) : null
        }
        isLoading={isLoading}
        error={isError}
        emptyState={
          <TableEmptyState
            title="No vendors found"
            description="Try adjusting your search to find a vendor."
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
                    setSelectedVendorId(null);
                  }}
                  placeholder="Search vendors..."
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
