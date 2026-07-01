import type { VendorBooking } from "@/features/bookings/services/booking.service";
import type {
  VendorBookingStatusFilter,
  VendorBookingStatusView,
} from "@/features/vendor/types/vendor-booking.types";

export const VENDOR_BOOKINGS_PAGE_SIZE = 8;

export function toDateTimeInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function formatTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return `${formatDate(value)} ${formatTime(value)}`;
}

export function formatAmount(booking: VendorBooking): string {
  return `Rs. ${Number(booking.totalAmount ?? booking.amount ?? 0).toFixed(2)}`;
}

export function formatVehicleType(vehicleType?: string): string {
  if (vehicleType === "TWO_WHEELER") return "Two wheeler";
  if (vehicleType === "FOUR_WHEELER") return "Four wheeler";
  return "-";
}

export function getBookingId(booking: VendorBooking): string {
  return booking.bookingId ?? booking.id;
}

export function getSlot(booking: VendorBooking): string {
  return String(booking.slotNumber ?? booking.slot ?? "-");
}

export function getCustomerName(booking: VendorBooking): string {
  return (
    booking.customerName ??
    booking.driverName ??
    booking.driver?.name ??
    booking.user?.name ??
    (booking.walkIn ? "On-site customer" : "Driver booking")
  );
}

export function getCustomerPhone(booking: VendorBooking): string {
  return booking.customerPhone ?? booking.driverPhone ?? "-";
}

export function getSourceLabel(booking: VendorBooking): string {
  return booking.walkIn ? "On-site" : "App Driver";
}

export function getOperationalStatus(
  booking: VendorBooking,
): VendorBookingStatusView {
  const status = booking.status?.toUpperCase();
  const slotStatus = booking.slotStatus;
  const paymentStatus = booking.paymentStatus?.toUpperCase();

  if (status === "COMPLETED") {
    return { label: "Completed", variant: "default" };
  }
  if (status === "CANCELLED") {
    return { label: "Cancelled", variant: "destructive" };
  }
  if (status === "PENDING" || slotStatus === "RESERVED") {
    return {
      label: paymentStatus === "PENDING" ? "Payment pending" : "Reserved",
      variant: "outline",
    };
  }
  if (status === "CONFIRMED" && slotStatus === "BOOKED") {
    return { label: "Booked", variant: "secondary" };
  }
  if (status === "CONFIRMED" && slotStatus === "OCCUPIED") {
    return {
      label: booking.walkIn ? "On-site active" : "Checked in",
      variant: "secondary",
    };
  }

  return { label: status || "Unknown", variant: "outline" };
}

export function getPaymentStatusVariant(
  status?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
}

export function matchesStatusFilter(
  booking: VendorBooking,
  filter: VendorBookingStatusFilter,
): boolean {
  if (filter === "ALL") return true;
  const status = booking.status?.toUpperCase();
  const slotStatus = booking.slotStatus;
  const paymentStatus = booking.paymentStatus?.toUpperCase();

  switch (filter) {
    case "RESERVED":
      return status === "PENDING" || slotStatus === "RESERVED";
    case "BOOKED":
      return status === "CONFIRMED" && slotStatus === "BOOKED";
    case "CHECKED_IN":
      return status === "CONFIRMED" && slotStatus === "OCCUPIED";
    case "COMPLETED":
      return status === "COMPLETED";
    case "CANCELLED":
      return status === "CANCELLED";
    case "PAYMENT_PENDING":
      return paymentStatus === "PENDING" || status === "PENDING";
    default:
      return true;
  }
}

export function canCheckIn(booking: VendorBooking): boolean {
  return booking.status === "CONFIRMED" && booking.slotStatus === "BOOKED";
}

export function canComplete(booking: VendorBooking): boolean {
  return booking.status === "CONFIRMED" && booking.slotStatus === "OCCUPIED";
}
