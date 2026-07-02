import type { MouseEvent } from "react";
import { Check, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AdminUser,
  AdminUserAction,
} from "@/features/admin/types/admin-user.types";

type AdminUserActionsProps = {
  user: AdminUser;
  pendingAction?: AdminUserAction | null;
  onApproveVendor: (user: AdminUser) => void;
  onBanDriver: (user: AdminUser) => void;
  onUnbanDriver: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
};

export function AdminUserActions({
  user,
  pendingAction,
  onApproveVendor,
  onBanDriver,
  onUnbanDriver,
  onDeleteUser,
}: AdminUserActionsProps) {
  function stopRowSelection(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <div
      data-row-action="true"
      className="flex flex-wrap items-center gap-2"
      onClick={stopRowSelection}
    >
      {user.role === "VENDOR" && user.approvalStatus === "PENDING" ? (
        <Button
          type="button"
          size="icon-sm"
          onClick={() => onApproveVendor(user)}
          disabled={pendingAction === "APPROVE_VENDOR"}
          aria-label="Approve vendor"
          title="Approve vendor"
        >
          <Check aria-hidden="true" />
        </Button>
      ) : null}

      {user.role === "DRIVER" && user.accountStatus === "ACTIVE" ? (
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          onClick={() => onBanDriver(user)}
          disabled={pendingAction === "BAN_DRIVER"}
          aria-label="Ban driver"
          title="Ban driver"
        >
          <ShieldX aria-hidden="true" />
        </Button>
      ) : null}

      {user.role === "DRIVER" && user.accountStatus === "BANNED" ? (
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={() => onUnbanDriver(user)}
          disabled={pendingAction === "UNBAN_DRIVER"}
          aria-label="Unban driver"
          title="Unban driver"
        >
          <ShieldCheck aria-hidden="true" />
        </Button>
      ) : null}

      <Button
        type="button"
        size="icon-sm"
        variant="destructive"
        onClick={() => onDeleteUser(user)}
        disabled={pendingAction === "DELETE_USER"}
        aria-label={user.role === "VENDOR" ? "Delete vendor" : "Delete driver"}
        title={user.role === "VENDOR" ? "Delete vendor" : "Delete driver"}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}
