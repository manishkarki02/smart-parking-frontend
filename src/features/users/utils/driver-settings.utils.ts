import type { ZodError } from "zod/v4";
import type { BookingResponse } from "@/features/bookings/types/booking.types";

export type FormErrors<T extends string> = Partial<Record<T, string>>;

export type DriverAccountStats = {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
};

export function buildDriverAccountStats(
  bookings?: BookingResponse[],
): DriverAccountStats {
  const items = bookings ?? [];
  return {
    totalBookings: items.length,
    completedBookings: items.filter((booking) => booking.status === "COMPLETED")
      .length,
    cancelledBookings: items.filter((booking) => booking.status === "CANCELLED")
      .length,
    totalSpent: items
      .filter((booking) => booking.paymentStatus === "SUCCESS")
      .reduce((sum, booking) => sum + (booking.totalAmount ?? 0), 0),
  };
}

export function toFormErrors<T extends string>(error: ZodError): FormErrors<T> {
  return error.issues.reduce<FormErrors<T>>((acc, issue) => {
    const key = issue.path[0];
    if (typeof key === "string") {
      acc[key as T] = issue.message;
    }
    return acc;
  }, {});
}

export function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "D";
}

export function shortDriverId(id?: string) {
  if (!id) return "-";
  return `DRV-${id.slice(0, 6).toUpperCase()}`;
}

export function formatDriverCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-US")}`;
}
