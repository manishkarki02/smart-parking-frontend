import type {
  AdminDriverAccountStatus,
  AdminRawUser,
  AdminUser,
  AdminUserRole,
  AdminUserRoleFilter,
  AdminUsersFilters,
  AdminUserStatus,
  AdminUserStatusFilter,
  AdminVendorApprovalStatus,
} from "@/features/admin/types/admin-user.types";
import { formatKathmanduDateTime } from "@/domain/shared/formatters";

export type AdminUserBadgeTone =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export const ADMIN_USER_ROLE_OPTIONS: Array<{
  value: AdminUserRoleFilter;
  label: string;
}> = [
  { value: "ALL", label: "All" },
  { value: "DRIVER", label: "Drivers" },
  { value: "VENDOR", label: "Vendors" },
];

export const ADMIN_USER_STATUS_OPTIONS: Array<{
  value: AdminUserStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All Users" },
  { value: "ACTIVE", label: "Active" },
  { value: "BANNED", label: "Banned" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
];

export function mapAdminRawUser(rawUser: AdminRawUser): AdminUser | null {
  const role = normalizeAdminUserRole(rawUser.role);

  if (!role) {
    return null;
  }

  const base = {
    id: String(rawUser.id),
    name: rawUser.businessName ?? rawUser.name,
    email: rawUser.email,
    phone: rawUser.phone,
    joinedAt: rawUser.joinedAt,
    createdAt: rawUser.createdAt,
    avatarUrl: rawUser.avatarUrl,
  };

  if (role === "VENDOR") {
    return {
      ...base,
      role,
      approvalStatus: getVendorApprovalStatus(rawUser),
    };
  }

  return {
    ...base,
    role,
    accountStatus: getDriverAccountStatus(rawUser),
  };
}

export function mapAdminRawUsers(rawUsers: AdminRawUser[]): AdminUser[] {
  return rawUsers
    .map(mapAdminRawUser)
    .filter((user): user is AdminUser => user !== null)
    .sort((first, second) => first.name.localeCompare(second.name));
}

export function mergeAdminUsers(
  vendors: AdminRawUser[],
  drivers: AdminRawUser[],
): AdminRawUser[] {
  const usersById = new Map<string, AdminRawUser>();

  [...vendors, ...drivers].forEach((user) => {
    usersById.set(String(user.id), user);
  });

  return Array.from(usersById.values());
}

export function filterAdminUsers(
  users: AdminUser[],
  filters: AdminUsersFilters,
): AdminUser[] {
  const search = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesRole = filters.role === "ALL" || user.role === filters.role;
    const status = getAdminUserStatus(user);
    const matchesStatus = filters.status === "ALL" || status === filters.status;
    const matchesSearch =
      search.length === 0 ||
      [user.name, user.email, user.phone, user.id]
        .join(" ")
        .toLowerCase()
        .includes(search);

    return matchesRole && matchesStatus && matchesSearch;
  });
}

export function paginateAdminUsers(
  users: AdminUser[],
  page: number,
  pageSize: number,
): AdminUser[] {
  const startIndex = (page - 1) * pageSize;
  return users.slice(startIndex, startIndex + pageSize);
}

export function getAdminUserStatus(user: AdminUser): AdminUserStatus {
  return user.role === "VENDOR" ? user.approvalStatus : user.accountStatus;
}

export function getAdminUserStatusTone(
  status: AdminUserStatus,
): AdminUserBadgeTone {
  switch (status) {
    case "APPROVED":
    case "ACTIVE":
      return "default";
    case "BANNED":
    case "REJECTED":
      return "destructive";
    case "PENDING":
      return "secondary";
  }
}

export function getAdminUserDisplayStatus(status: AdminUserStatus): string {
  return formatEnumLabel(status);
}

export function getAdminUserRoleLabel(role: AdminUserRole): string {
  return role === "VENDOR" ? "Vendor" : "Driver";
}

export function getAdminUserInitials(user: AdminUser): string {
  const words = user.name.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join("");

  return initials.toUpperCase() || "U";
}

export function formatAdminUserJoinedDate(user: AdminUser): string {
  return formatKathmanduDateTime(user.joinedAt ?? user.createdAt, "N/A");
}

export function truncateAdminUserId(id: string): string {
  if (id.length <= 10) {
    return id;
  }

  return `${id.slice(0, 8)}...`;
}

export function formatAdminUsersCount(count: number): string {
  return `${count} ${count === 1 ? "user" : "users"} total`;
}

function normalizeAdminUserRole(role: string): AdminUserRole | null {
  if (role === "VENDOR" || role === "DRIVER") {
    return role;
  }

  return null;
}

function getVendorApprovalStatus(
  rawUser: AdminRawUser,
): AdminVendorApprovalStatus {
  if (rawUser.status === "REJECTED") {
    return "REJECTED";
  }

  if (rawUser.status === "PENDING" || rawUser.approved === false) {
    return "PENDING";
  }

  return "APPROVED";
}

function getDriverAccountStatus(rawUser: AdminRawUser): AdminDriverAccountStatus {
  if (rawUser.status === "BANNED" || rawUser.banned) {
    return "BANNED";
  }

  return "ACTIVE";
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}
