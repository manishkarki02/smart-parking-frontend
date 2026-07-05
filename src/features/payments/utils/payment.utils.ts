import type { BadgeVariant } from "@/features/bookings/utils/booking-status";
import type {
  BookingSource,
  PaymentMethod,
  PaymentStatus,
  VehicleType,
} from "@/features/payments/types/payment.types";
import {
  formatKathmanduDate,
  formatKathmanduDateTime,
} from "@/domain/shared/formatters";

export type PaymentStatusFilter = "ALL" | PaymentStatus;
export type PaymentMethodFilter = "ALL" | PaymentMethod;

export const PAYMENT_STATUS_OPTIONS: Array<{
  value: PaymentStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All Statuses" },
  { value: "SUCCESS", label: "Success" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
];

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethodFilter;
  label: string;
}> = [
  { value: "ALL", label: "All Methods" },
  { value: "KHALTI", label: "Khalti" },
  { value: "CASH", label: "Cash" },
  { value: "ESEWA", label: "eSewa" },
];

export function formatPaymentCurrency(amount: number): string {
  return `Rs. ${Number(amount ?? 0).toFixed(2)}`;
}

export function formatPaymentDateTime(value?: string | null): string {
  return formatKathmanduDateTime(value, "-");
}

export function formatPaymentDate(value?: string | null): string {
  return formatKathmanduDate(value, "-", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPaymentDuration(minutes?: number | null): string {
  if (minutes === undefined || minutes === null || minutes < 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${remainingMinutes} min`;
}

export function truncatePaymentId(id?: string | null): string {
  if (!id) {
    return "-";
  }

  if (id.length <= 10) {
    return id;
  }

  return `${id.slice(0, 8)}...`;
}

export function formatPaymentStatus(status: PaymentStatus): string {
  return formatEnumLabel(status);
}

export function formatPaymentMethod(method: PaymentMethod): string {
  if (method === "ESEWA") {
    return "eSewa";
  }

  return formatEnumLabel(method);
}

export function formatVehicleType(vehicleType?: VehicleType | null): string {
  if (vehicleType === "TWO_WHEELER") {
    return "Two Wheeler";
  }

  if (vehicleType === "FOUR_WHEELER") {
    return "Four Wheeler";
  }

  return "-";
}

export function formatBookingSource(source?: BookingSource | null): string {
  if (source === "WALK_IN") {
    return "Walk-in";
  }

  if (source === "ONLINE") {
    return "Online";
  }

  return "-";
}

export function getPaymentStatusBadgeVariant(
  status: PaymentStatus,
): BadgeVariant {
  switch (status) {
    case "SUCCESS":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
  }
}

export function getPaymentMethodBadgeVariant(
  method: PaymentMethod,
): BadgeVariant {
  switch (method) {
    case "KHALTI":
      return "default";
    case "CASH":
      return "secondary";
    case "ESEWA":
      return "outline";
  }
}

export function getPaymentInitials(name?: string | null): string {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "P";
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}
