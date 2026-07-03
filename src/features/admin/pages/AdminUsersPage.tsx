import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { PageHeader } from "@/common/components/PageHeader";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { AdminUserDetailsPanel } from "@/features/admin/components/AdminUserDetailsPanel";
import { AdminUsersFilterBar } from "@/features/admin/components/AdminUsersFilterBar";
import { AdminUsersPageSkeleton } from "@/features/admin/components/AdminUsersPageSkeleton";
import {
  adminUsersCompactColumns,
  getAdminUsersTableColumns,
} from "@/features/admin/components/AdminUsersTable";
import {
  useApproveVendor,
  useAdminUsers,
  useBanAdminUser,
  useDeleteAdminUser,
  useUnbanAdminUser,
} from "@/features/admin/hooks/useAdminUsers";
import type {
  AdminUser,
  AdminUserAction,
  AdminUserRoleFilter,
  AdminUsersFilters,
} from "@/features/admin/types/admin-user.types";
import {
  filterAdminUsers,
  getAdminUserRoleLabel,
  paginateAdminUsers,
} from "@/features/admin/utils/admin-user.utils";

type AdminUsersPageProps = {
  initialRole?: AdminUserRoleFilter;
};

type SelectionState =
  | { mode: "auto" }
  | { mode: "closed" }
  | { mode: "selected"; id: string };

type PendingConfirmation = {
  action: "BAN_DRIVER" | "DELETE_USER";
  user: AdminUser;
} | null;

const DEFAULT_PAGE_SIZE = 10;

export function AdminUsersPage({ initialRole = "ALL" }: AdminUsersPageProps) {
  const [filters, setFilters] = useState<AdminUsersFilters>({
    search: "",
    role: initialRole,
    status: "ALL",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selection, setSelection] = useState<SelectionState>({ mode: "auto" });
  const [confirmation, setConfirmation] = useState<PendingConfirmation>(null);
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminUsers(filters.role);
  const approveVendorMutation = useApproveVendor();
  const banUserMutation = useBanAdminUser();
  const unbanUserMutation = useUnbanAdminUser();
  const deleteUserMutation = useDeleteAdminUser();

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, filters),
    [filters, users],
  );
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedUsers = useMemo(
    () => paginateAdminUsers(filteredUsers, currentPage, pageSize),
    [currentPage, filteredUsers, pageSize],
  );
  const selectedUser = useMemo(
    () => getSelectedUser(filteredUsers, selection),
    [filteredUsers, selection],
  );
  const headerContent = useMemo(
    () => (
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold tracking-tight text-foreground">
          Users
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          Manage drivers and vendors on the platform
        </p>
      </div>
    ),
    [],
  );
  const pendingAction = getPendingAction({
    approvePending: approveVendorMutation.isPending,
    banPending: banUserMutation.isPending,
    unbanPending: unbanUserMutation.isPending,
    deletePending: deleteUserMutation.isPending,
  });
  const columns = getAdminUsersTableColumns({
    pendingAction,
    onApproveVendor: handleApproveVendor,
    onBanDriver: handleBanDriver,
    onUnbanDriver: handleUnbanDriver,
    onDeleteUser: handleDeleteUser,
  });

  function updateFilters(nextFilters: AdminUsersFilters) {
    setFilters(nextFilters);
    setPage(1);
    setSelection({ mode: "auto" });
  }

  function handleApproveVendor(user: AdminUser) {
    if (user.role !== "VENDOR") {
      return;
    }

    approveVendorMutation.mutate(user.id);
  }

  function handleBanDriver(user: AdminUser) {
    if (user.role !== "DRIVER") {
      return;
    }

    setConfirmation({ action: "BAN_DRIVER", user });
  }

  function handleUnbanDriver(user: AdminUser) {
    if (user.role !== "DRIVER") {
      return;
    }

    unbanUserMutation.mutate(user.id);
  }

  function handleDeleteUser(user: AdminUser) {
    setConfirmation({ action: "DELETE_USER", user });
  }

  function handleConfirmAction() {
    if (!confirmation) {
      return;
    }

    if (confirmation.action === "BAN_DRIVER") {
      banUserMutation.mutate(confirmation.user.id, {
        onSuccess: () => setConfirmation(null),
      });
      return;
    }

    deleteUserMutation.mutate(confirmation.user, {
      onSuccess: () => {
        setSelection({ mode: "auto" });
        setConfirmation(null);
      },
    });
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Users" content={headerContent} />
        <AdminUsersPageSkeleton />
      </>
    );
  }

  if (isError) {
    const message = getApiErrorMessage(error);
    const readableMessage = Array.isArray(message) ? message.join(", ") : message;

    return (
      <>
        <PageHeader title="Users" content={headerContent} />
        <Card className="rounded-lg border shadow-none">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <RefreshCw className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Could not load users.</h1>
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

  return (
    <div className="space-y-4">
      <PageHeader title="Users" content={headerContent} />

      <SplitDataTable
        columns={columns}
        compactColumns={adminUsersCompactColumns}
        rows={paginatedUsers}
        getRowId={(user) => user.id}
        selectedRowId={selectedUser?.id ?? null}
        onRowSelect={(user) =>
          setSelection((current) =>
            current.mode === "selected" && current.id === user.id
              ? { mode: "closed" }
              : { mode: "selected", id: user.id },
          )
        }
        onDetailClose={() => setSelection({ mode: "closed" })}
        detailTitle={selectedUser?.name ?? "User details"}
        detailPanel={
          <AdminUserDetailsPanel
            user={selectedUser}
            pendingAction={pendingAction}
            onClose={() => setSelection({ mode: "closed" })}
            onApproveVendor={handleApproveVendor}
            onBanDriver={handleBanDriver}
            onUnbanDriver={handleUnbanDriver}
            onDeleteUser={handleDeleteUser}
          />
        }
        emptyState={
          <TableEmptyState
            title={getEmptyStateTitle(filters.role, users.length)}
            description="Try adjusting the search, role, or status filters."
          />
        }
        toolbar={
          <AdminUsersFilterBar
            filters={filters}
            totalUsers={filteredUsers.length}
            onFiltersChange={updateFilters}
          />
        }
        pagination={
          <DataTablePagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        }
      />

      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={getConfirmationTitle(confirmation)}
        description={getConfirmationDescription(confirmation)}
        confirmLabel={
          confirmation?.action === "BAN_DRIVER" ? "Ban Driver" : "Delete"
        }
        onConfirm={handleConfirmAction}
        isLoading={banUserMutation.isPending || deleteUserMutation.isPending}
      />
    </div>
  );
}

function getSelectedUser(
  users: AdminUser[],
  selection: SelectionState,
): AdminUser | null {
  if (selection.mode === "closed") {
    return null;
  }

  if (selection.mode === "selected") {
    return users.find((user) => user.id === selection.id) ?? users[0] ?? null;
  }

  return users[0] ?? null;
}

function getPendingAction({
  approvePending,
  banPending,
  unbanPending,
  deletePending,
}: {
  approvePending: boolean;
  banPending: boolean;
  unbanPending: boolean;
  deletePending: boolean;
}): AdminUserAction | null {
  if (approvePending) {
    return "APPROVE_VENDOR";
  }

  if (banPending) {
    return "BAN_DRIVER";
  }

  if (unbanPending) {
    return "UNBAN_DRIVER";
  }

  if (deletePending) {
    return "DELETE_USER";
  }

  return null;
}

function getEmptyStateTitle(role: AdminUserRoleFilter, totalUsers: number) {
  if (totalUsers > 0) {
    return "No search results";
  }

  if (role === "DRIVER") {
    return "No drivers found";
  }

  if (role === "VENDOR") {
    return "No vendors found";
  }

  return "No users found";
}

function getConfirmationTitle(confirmation: PendingConfirmation): string {
  if (!confirmation) {
    return "Confirm action";
  }

  if (confirmation.action === "BAN_DRIVER") {
    return "Ban this driver?";
  }

  return `Delete this ${getAdminUserRoleLabel(confirmation.user.role).toLowerCase()}?`;
}

function getConfirmationDescription(confirmation: PendingConfirmation): string {
  if (!confirmation) {
    return "Please confirm this action.";
  }

  if (confirmation.action === "BAN_DRIVER") {
    return `${confirmation.user.name} will no longer be able to access the platform until unbanned.`;
  }

  return `${confirmation.user.name} will be removed from active admin user lists. This action cannot be undone.`;
}
