import { Badge } from "@/components/ui/badge";
import type { AdminUserStatus } from "@/features/admin/types/admin-user.types";
import {
  getAdminUserDisplayStatus,
  getAdminUserStatusTone,
} from "@/features/admin/utils/admin-user.utils";

type AdminUserStatusBadgeProps = {
  status: AdminUserStatus;
};

export function AdminUserStatusBadge({ status }: AdminUserStatusBadgeProps) {
  return (
    <Badge variant={getAdminUserStatusTone(status)}>
      {getAdminUserDisplayStatus(status)}
    </Badge>
  );
}
