import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";
import type {
  AdminBookingStatusCount,
  AdminDashboardResponse,
  AdminRecentBooking,
  AdminRecentUser,
  AdminStats,
  AdminUser,
} from "@/features/admin/types/admin.types";
import {
  formatKathmanduDate,
  formatKathmanduTime,
} from "@/domain/shared/formatters";

export type AdminStatusTone = "default" | "secondary" | "destructive" | "outline";

type BuildAdminDashboardDataInput = {
  stats: AdminStats;
  bookings: AdminBooking[];
  vendors: AdminUser[];
  drivers: AdminUser[];
};

export function buildAdminDashboardData({
  stats,
  bookings,
  vendors,
  drivers,
}: BuildAdminDashboardDataInput): AdminDashboardResponse {
  const approvedVendors = vendors.filter((vendor) =>
    isApprovedVendor(vendor),
  ).length;
  const bannedDrivers = drivers.filter((driver) => isBannedUser(driver)).length;

  return {
    summary: {
      totalBookings: stats.totalBookings,
      totalVendors: stats.totalVendors,
      totalDrivers: stats.totalDrivers,
      approvedVendors,
      pendingVendors: Math.max(vendors.length - approvedVendors, 0),
      activeDrivers: Math.max(drivers.length - bannedDrivers, 0),
      bannedDrivers,
    },
    bookingStatusCounts: getBookingStatusCounts(bookings),
    recentBookings: [...bookings]
      .sort((first, second) => getBookingTime(second) - getBookingTime(first))
      .slice(0, 5)
      .map(toRecentBooking),
    recentVendors: vendors.slice(0, 5).map((vendor) => toRecentUser(vendor, "vendor")),
    recentDrivers: drivers.slice(0, 5).map((driver) => toRecentUser(driver, "driver")),
  };
}

export function formatAdminCurrency(amount: number): string {
  return `Rs. ${Number(amount).toFixed(2)}`;
}

export function formatAdminDate(value: string): string {
  return formatKathmanduDate(value, "-", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAdminTimeRange(startTime: string, endTime: string): string {
  return `${formatAdminTime(startTime)} - ${formatAdminTime(endTime)}`;
}

export function formatAdminCurrentDate(value = new Date()): string {
  return formatKathmanduDate(value, "-", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function truncateId(id: string): string {
  if (id.length <= 10) {
    return id;
  }

  return `${id.slice(0, 8)}...`;
}

export function formatAdminStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatAdminVehicleType(vehicleType: string): string {
  if (vehicleType === "TWO_WHEELER") {
    return "Two Wheeler";
  }

  if (vehicleType === "FOUR_WHEELER") {
    return "Four Wheeler";
  }

  return formatAdminStatusLabel(vehicleType);
}

export function getBookingStatusTone(status: string): AdminStatusTone {
  switch (status.toUpperCase()) {
    case "COMPLETED":
    case "SUCCESS":
    case "APPROVED":
    case "ACTIVE":
      return "default";
    case "CANCELLED":
    case "FAILED":
    case "BANNED":
      return "destructive";
    case "OCCUPIED":
    case "BOOKED":
    case "CONFIRMED":
    case "PENDING":
    case "RESERVED":
      return "secondary";
    default:
      return "outline";
  }
}

export function getUserStatusTone(status: string): AdminStatusTone {
  return getBookingStatusTone(status);
}

function toRecentBooking(booking: AdminBooking): AdminRecentBooking {
  return {
    id: booking.bookingId,
    driverName:
      booking.driverName ??
      booking.customerName ??
      (booking.walkIn ? "Walk-in customer" : "Driver booking"),
    driverPhone: booking.customerPhone ?? "-",
    parkingName: booking.parkingLocationName,
    slotCode: booking.slotNumber,
    vehicleType: booking.vehicleType,
    startTime: booking.startTime,
    endTime: booking.endTime,
    bookingDate: booking.startTime,
    status: getDisplayBookingStatus(booking),
    slotStatus: booking.slotStatus,
    amount: booking.totalAmount,
  };
}

function toRecentUser(
  user: AdminUser,
  userType: "vendor" | "driver",
): AdminRecentUser {
  return {
    id: String(user.id),
    name: user.businessName ?? user.name,
    email: user.email,
    phone: user.phone,
    status: userType === "vendor" ? getVendorStatus(user) : getDriverStatus(user),
  };
}

function getBookingStatusCounts(bookings: AdminBooking[]): AdminBookingStatusCount {
  return bookings.reduce<AdminBookingStatusCount>(
    (counts, booking) => {
      const displayStatus = getDisplayBookingStatus(booking);

      if (displayStatus === "OCCUPIED") {
        return { ...counts, occupied: counts.occupied + 1 };
      }

      if (displayStatus === "COMPLETED") {
        return { ...counts, completed: counts.completed + 1 };
      }

      if (displayStatus === "CANCELLED") {
        return { ...counts, cancelled: counts.cancelled + 1 };
      }

      return counts;
    },
    {
      occupied: 0,
      completed: 0,
      cancelled: 0,
    },
  );
}

function getDisplayBookingStatus(booking: AdminBooking): string {
  if (booking.slotStatus === "OCCUPIED") {
    return "OCCUPIED";
  }

  if (booking.slotStatus === "BOOKED") {
    return "BOOKED";
  }

  if (booking.slotStatus === "RESERVED") {
    return "RESERVED";
  }

  return booking.status;
}

function getVendorStatus(vendor: AdminUser): string {
  if (vendor.status) {
    return vendor.status;
  }

  return isApprovedVendor(vendor) ? "APPROVED" : "PENDING";
}

function getDriverStatus(driver: AdminUser): string {
  if (driver.status) {
    return driver.status;
  }

  return isBannedUser(driver) ? "BANNED" : "ACTIVE";
}

function isApprovedVendor(vendor: AdminUser): boolean {
  if (vendor.status) {
    return vendor.status.toUpperCase() === "APPROVED";
  }

  return vendor.approved !== false;
}

function isBannedUser(user: AdminUser): boolean {
  if (user.status) {
    return user.status.toUpperCase() === "BANNED";
  }

  return Boolean(user.banned);
}

function getBookingTime(booking: AdminBooking): number {
  const time = new Date(booking.startTime).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatAdminTime(value: string): string {
  return formatKathmanduTime(value, "-");
}
