import { Building2, Car, UserRound } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InfoItem } from "@/common/components/detail-panel/InfoItem";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
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

type AdminUserDetailsPanelProps = {
  user: AdminUser | null;
  pendingAction?: AdminUserAction | null;
  onClose: () => void;
  onApproveVendor: (user: AdminUser) => void;
  onBanDriver: (user: AdminUser) => void;
  onUnbanDriver: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
};

export function AdminUserDetailsPanel({
  user,
  pendingAction,
  onClose,
  onApproveVendor,
  onBanDriver,
  onUnbanDriver,
  onDeleteUser,
}: AdminUserDetailsPanelProps) {
  if (!user) {
    return (
      <div className="rounded-lg border bg-card">
        <Empty className="min-h-[420px] border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRound aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Select a user</EmptyTitle>
            <EmptyDescription>
              Choose a user row to view account details.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const status = getAdminUserStatus(user);

  return (
    <SplitDetailPanel
      title="User Details"
      subtitle={truncateAdminUserId(user.id)}
      onClose={onClose}
    >
      <div className="space-y-4">
        <section className="flex flex-col items-center rounded-lg border bg-muted/20 p-5 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-background text-xl font-semibold shadow-sm">
            {getAdminUserInitials(user)}
          </span>
          <h2 className="mt-3 text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <AdminUserStatusBadge status={status} />
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
              {getAdminUserRoleLabel(user.role)}
            </span>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Phone" value={user.phone || "No phone"} />
          <InfoItem label="Role" value={getAdminUserRoleLabel(user.role)} />
          <InfoItem label="Joined" value={formatAdminUserJoinedDate(user)} />
          <InfoItem label="User ID" value={user.id} />
        </section>

        {user.role === "VENDOR" ? (
          <section className="space-y-3 rounded-lg border p-4">
            <SectionTitle icon={Building2} title="Vendor Details" />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Approval status" value={<AdminUserStatusBadge status={user.approvalStatus} />} />
              <InfoItem
                label="Parking locations"
                value={user.parkingLocationsCount ?? "N/A"}
              />
              <InfoItem label="Total bookings" value={user.totalBookings ?? "N/A"} />
            </div>
          </section>
        ) : (
          <section className="space-y-3 rounded-lg border p-4">
            <SectionTitle icon={Car} title="Driver Details" />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Account status" value={<AdminUserStatusBadge status={user.accountStatus} />} />
              <InfoItem label="Total bookings" value={user.totalBookings ?? "N/A"} />
              <InfoItem
                label="Completed bookings"
                value={user.completedBookings ?? "N/A"}
              />
              <InfoItem
                label="Cancelled bookings"
                value={user.cancelledBookings ?? "N/A"}
              />
            </div>
          </section>
        )}

        <section className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Admin Actions</h3>
          <AdminUserActions
            user={user}
            pendingAction={pendingAction}
            onApproveVendor={onApproveVendor}
            onBanDriver={onBanDriver}
            onUnbanDriver={onUnbanDriver}
            onDeleteUser={onDeleteUser}
          />
        </section>
      </div>
    </SplitDetailPanel>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof Building2;
  title: string;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-medium">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      {title}
    </h3>
  );
}
