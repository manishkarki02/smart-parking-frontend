import {
  mockAdminStats,
  mockAdminBookings,
  mockVendors,
  mockDrivers,
} from "@/mocks/data";
import type {
  AdminStats,
  AdminUser,
  AdminBooking,
} from "../types/admin.types";

export async function getDashboard(): Promise<AdminStats> {
  return mockAdminStats;
}

export async function getAllBookings(): Promise<AdminBooking[]> {
  return mockAdminBookings;
}

export async function getVendors(): Promise<AdminUser[]> {
  return mockVendors;
}

export async function getDrivers(): Promise<AdminUser[]> {
  return mockDrivers;
}
