import type { ReactNode } from "react";
import { Check, ShieldCheck, ShieldX, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SplitDetailPanel } from "@/common/components/layout/SplitDetailPanel";
import { AdminUserStatusBadge } from "@/features/admin/components/AdminUserStatusBadge";
import { cn } from "@/lib/utils";
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
      subtitle={
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {getAdminUserRoleLabel(user.role)}
        </Badge>
      }
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="flex flex-col items-center px-4 py-6 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-blue-50 text-3xl font-semibold text-blue-600">
            {getAdminUserInitials(user)}
          </span>
          <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
          <div className="mt-4">
            <AdminUserStatusBadge status={status} />
          </div>
        </section>

        <DetailSection>
          <DetailRow label="Phone" value={user.phone || "No phone"} />
          <DetailRow label="Role" value={getAdminUserRoleLabel(user.role)} />
          <DetailRow label="Joined" value={formatAdminUserJoinedDate(user)} />
          <DetailRow
            label="User ID"
            value={truncateAdminUserId(user.id)}
            title={user.id}
          />
        </DetailSection>

        {user.role === "VENDOR" ? (
          <DetailSection>
            <SectionTitle title="Approval Status" />
            <DetailRow
              label="Status"
              value={<AdminUserStatusBadge status={user.approvalStatus} />}
            />
            <DetailRow
              label="Parking Locations"
              value={formatCount(user.parkingLocationsCount, "location")}
            />
            <DetailRow
              label="Total Bookings"
              value={formatCount(user.totalBookings, "booking")}
            />
          </DetailSection>
        ) : (
          <DetailSection>
            <SectionTitle title="Account Status" />
            <DetailRow
              label="Status"
              value={<AdminUserStatusBadge status={user.accountStatus} />}
            />
            <DetailRow
              label="Total Bookings"
              value={formatCount(user.totalBookings, "booking")}
            />
            <DetailRow
              label="Completed"
              value={formatCount(user.completedBookings, "booking")}
            />
            <DetailRow
              label="Cancelled"
              value={formatCount(user.cancelledBookings, "booking")}
            />
          </DetailSection>
        )}

        <DetailSection>
          <SectionTitle title="Actions" />
          <DetailActions
            user={user}
            pendingAction={pendingAction}
            onApproveVendor={onApproveVendor}
            onBanDriver={onBanDriver}
            onUnbanDriver={onUnbanDriver}
            onDeleteUser={onDeleteUser}
          />
        </DetailSection>
      </div>
    </SplitDetailPanel>
  );
}

function DetailSection({ children }: { children: ReactNode }) {
  return <section className="space-y-4 border-t pt-5">{children}</section>;
}

function DetailRow({
  label,
  value,
  title,
}: {
  label: string;
  value?: ReactNode;
  title?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] items-start gap-4 text-sm">
      <p className="font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div
        className="min-w-0 justify-self-end break-words text-right font-semibold"
        title={title}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h3>
  );
}

function DetailActions({
  user,
  pendingAction,
  onApproveVendor,
  onBanDriver,
  onUnbanDriver,
  onDeleteUser,
}: {
  user: AdminUser;
  pendingAction?: AdminUserAction | null;
  onApproveVendor: (user: AdminUser) => void;
  onBanDriver: (user: AdminUser) => void;
  onUnbanDriver: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}) {
  return (
    <div className="space-y-2">
      {user.role === "VENDOR" && user.approvalStatus === "PENDING" ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
          onClick={() => onApproveVendor(user)}
          disabled={pendingAction === "APPROVE_VENDOR"}
        >
          <Check aria-hidden="true" />
          Approve Vendor
        </Button>
      ) : null}

      {user.role === "DRIVER" && user.accountStatus === "ACTIVE" ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={() => onBanDriver(user)}
          disabled={pendingAction === "BAN_DRIVER"}
        >
          <ShieldX aria-hidden="true" />
          Ban Driver
        </Button>
      ) : null}

      {user.role === "DRIVER" && user.accountStatus === "BANNED" ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
          onClick={() => onUnbanDriver(user)}
          disabled={pendingAction === "UNBAN_DRIVER"}
        >
          <ShieldCheck aria-hidden="true" />
          Unban Driver
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
          pendingAction === "DELETE_USER" && "opacity-70",
        )}
        onClick={() => onDeleteUser(user)}
        disabled={pendingAction === "DELETE_USER"}
      >
        <Trash2 aria-hidden="true" />
        Delete {getAdminUserRoleLabel(user.role)}
      </Button>
    </div>
  );
}

function formatCount(count: number | undefined, noun: string): string {
  if (count === undefined) {
    return "N/A";
  }

  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}
