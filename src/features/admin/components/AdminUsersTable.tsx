import type { DataTableColumn } from "@/common";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/features/admin/components/AdminUserActions";
import { AdminUserStatusBadge } from "@/features/admin/components/AdminUserStatusBadge";
import type {
  AdminUser,
  AdminUserAction,
} from "@/features/admin/types/admin-user.types";
import {
  formatAdminUserJoinedDate,
  getAdminUserInitials,
  getAdminUserRoleLabel,
  getAdminUserStatus,
  truncateAdminUserId,
} from "@/features/admin/utils/admin-user.utils";

type AdminUsersTableColumnOptions = {
  pendingAction?: AdminUserAction | null;
  onApproveVendor: (user: AdminUser) => void;
  onBanDriver: (user: AdminUser) => void;
  onUnbanDriver: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
};

export function getAdminUsersTableColumns({
  pendingAction,
  onApproveVendor,
  onBanDriver,
  onUnbanDriver,
  onDeleteUser,
}: AdminUsersTableColumnOptions): DataTableColumn<AdminUser>[] {
  return [
    {
      id: "user",
      header: "User",
      cell: (user) => (
        <div className="flex min-w-56 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {getAdminUserInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant="outline">{getAdminUserRoleLabel(user.role)}</Badge>
      ),
      compact: true,
    },
    {
      id: "phone",
      header: "Phone",
      cell: (user) => user.phone || "No phone",
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <AdminUserStatusBadge status={getAdminUserStatus(user)} />,
      compact: true,
    },
    {
      id: "joined",
      header: "Joined",
      cell: (user) => formatAdminUserJoinedDate(user),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (user) => (
        <AdminUserActions
          user={user}
          pendingAction={pendingAction}
          onApproveVendor={onApproveVendor}
          onBanDriver={onBanDriver}
          onUnbanDriver={onUnbanDriver}
          onDeleteUser={onDeleteUser}
        />
      ),
      compact: true,
    },
  ];
}

export const adminUsersCompactColumns: DataTableColumn<AdminUser>[] = [
  {
    id: "user",
    header: "User",
    cell: (user) => (
      <div className="flex min-w-52 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {getAdminUserInitials(user)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {truncateAdminUserId(user.id)}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    header: "Role",
    cell: (user) => (
      <Badge variant="outline">{getAdminUserRoleLabel(user.role)}</Badge>
    ),
    compact: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (user) => <AdminUserStatusBadge status={getAdminUserStatus(user)} />,
    compact: true,
  },
];
