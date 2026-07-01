export interface AdminStats {
  totalBookings: number;
  totalVendors: number;
  totalDrivers: number;
  totalAdmins?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  approved?: boolean;
  banned?: boolean;
  businessName?: string;
}

export type AdminDashboardSummary = {
  totalBookings: number;
  totalVendors: number;
  totalDrivers: number;
  approvedVendors: number;
  pendingVendors: number;
  activeDrivers: number;
  bannedDrivers: number;
};

export type AdminBookingStatusCount = {
  occupied: number;
  completed: number;
  cancelled: number;
};

export type AdminRecentBooking = {
  id: string;
  driverName: string;
  driverPhone: string;
  parkingName: string;
  slotCode: string;
  vehicleType: "TWO_WHEELER" | "FOUR_WHEELER";
  startTime: string;
  endTime: string;
  bookingDate: string;
  status: string;
  slotStatus?: string;
  amount: number;
};

export type AdminRecentUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  avatarUrl?: string;
};

export type AdminDashboardResponse = {
  summary: AdminDashboardSummary;
  bookingStatusCounts: AdminBookingStatusCount;
  recentBookings: AdminRecentBooking[];
  recentVendors: AdminRecentUser[];
  recentDrivers: AdminRecentUser[];
};
