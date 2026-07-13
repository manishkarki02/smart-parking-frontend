import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";
import {
  formatKathmanduDate,
  formatKathmanduDateTime,
  formatKathmanduTime,
} from "@/domain/shared/formatters";

export function formatBookingDate(value?: string | null): string {
  return formatKathmanduDate(value, "-");
}

export function formatBookingTime(value?: string | null): string {
  return formatKathmanduTime(value, "-");
}

export function formatBookingDateTime(value?: string | null): string {
  if (!value) return "-";
  return `${formatBookingDate(value)} ${formatBookingTime(value)}`;
}

export function formatBookingDateTimeLong(value?: string | null): string {
  return formatKathmanduDateTime(value, "-");
}

export function formatBookingAmount(value?: number | null): string {
  return `Rs. ${Number(value ?? 0).toFixed(2)}`;
}

export function formatVehicleType(vehicleType?: string): string {
  if (vehicleType === "TWO_WHEELER") return "Two wheeler";
  if (vehicleType === "FOUR_WHEELER") return "Four wheeler";
  return "-";
}

export function formatBookingCustomerName(booking: AdminBooking): string {
  if (booking.driverName) return booking.driverName;
  if (booking.customerName) return booking.customerName;
  return booking.walkIn ? "Walk-in customer" : "Driver booking";
}
