export type AdminUserRole = "VENDOR" | "DRIVER";

export type AdminUserRoleFilter = "ALL" | AdminUserRole;

export type AdminUserStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "BANNED"
  | "APPROVED"
  | "PENDING";

export type AdminVendorApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export type AdminDriverAccountStatus = "ACTIVE" | "BANNED";

export type AdminUserStatus =
  | AdminVendorApprovalStatus
  | AdminDriverAccountStatus;

export type AdminRawUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  approved?: boolean;
  banned?: boolean;
  businessName?: string;
  joinedAt?: string;
  createdAt?: string;
  avatarUrl?: string;
};

export type AdminUserBase = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  joinedAt?: string;
  createdAt?: string;
  avatarUrl?: string;
};

export type AdminVendorUser = AdminUserBase & {
  role: "VENDOR";
  approvalStatus: AdminVendorApprovalStatus;
  parkingLocationsCount?: number;
  totalBookings?: number;
};

export type AdminDriverUser = AdminUserBase & {
  role: "DRIVER";
  accountStatus: AdminDriverAccountStatus;
  totalBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
};

export type AdminUser = AdminVendorUser | AdminDriverUser;

export type AdminUsersFilters = {
  search: string;
  role: AdminUserRoleFilter;
  status: AdminUserStatusFilter;
};

export type AdminUserAction =
  | "APPROVE_VENDOR"
  | "BAN_DRIVER"
  | "UNBAN_DRIVER"
  | "DELETE_USER";
