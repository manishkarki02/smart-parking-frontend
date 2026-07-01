import type { AdminBooking } from "@/features/bookings/types/admin-booking.types";

export function formatBookingDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function formatBookingTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBookingDateTime(value?: string | null): string {
  if (!value) return "-";
  return `${formatBookingDate(value)} ${formatBookingTime(value)}`;
}

export function formatBookingDateTimeLong(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
