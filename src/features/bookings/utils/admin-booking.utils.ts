import type { BadgeVariant } from "@/features/bookings/utils/booking-status";
import type {
  AdminBooking,
  AdminBookingFilters,
  AdminBookingStats,
  AdminBookingStatusFilter,
  AdminPaymentStatusFilter,
} from "@/features/bookings/types/admin-booking.types";

export type AdminBookingTone = BadgeVariant;

export const ADMIN_BOOKING_STATUS_OPTIONS: Array<{
  value: AdminBookingStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const ADMIN_PAYMENT_STATUS_OPTIONS: Array<{
  value: AdminPaymentStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All Payment Status" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "N_A", label: "N/A" },
];

export function filterAdminBookings(
  bookings: AdminBooking[],
  filters: AdminBookingFilters,
): AdminBooking[] {
  const searchValue = filters.search.trim().toLowerCase();

  return bookings.filter((booking) => {
    const matchesSearch =
      searchValue.length === 0 ||
      getAdminBookingSearchText(booking).includes(searchValue);
    const matchesStatus =
      filters.status === "ALL" ||
      getAdminBookingDisplayStatus(booking) === filters.status;
    const matchesPaymentStatus =
      filters.paymentStatus === "ALL" ||
      getAdminBookingPaymentStatus(booking) === filters.paymentStatus;
    const matchesDate =
      !filters.date || getDateInputValue(booking.startTime) === filters.date;

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
  });
}

export function paginateAdminBookings(
  bookings: AdminBooking[],
  page: number,
  pageSize: number,
): AdminBooking[] {
  const startIndex = (page - 1) * pageSize;
  return bookings.slice(startIndex, startIndex + pageSize);
}

export function getAdminBookingStats(bookings: AdminBooking[]): AdminBookingStats {
  return bookings.reduce<AdminBookingStats>(
    (stats, booking) => {
      const status = getAdminBookingDisplayStatus(booking);

      return {
        totalBookings: stats.totalBookings + 1,
        occupied: stats.occupied + (status === "OCCUPIED" ? 1 : 0),
        completed: stats.completed + (status === "COMPLETED" ? 1 : 0),
        cancelled: stats.cancelled + (status === "CANCELLED" ? 1 : 0),
      };
    },
    {
      totalBookings: 0,
      occupied: 0,
      completed: 0,
      cancelled: 0,
    },
  );
}

export function getAdminBookingDisplayStatus(
  booking: AdminBooking,
): AdminBookingStatusFilter {
  if (booking.slotStatus === "OCCUPIED") {
    return "OCCUPIED";
  }

  if (booking.status === "PENDING") {
    return "PENDING";
  }

  if (booking.status === "CONFIRMED") {
    return "CONFIRMED";
  }

  if (booking.status === "COMPLETED") {
    return "COMPLETED";
  }

  if (booking.status === "CANCELLED") {
    return "CANCELLED";
  }

  return "CONFIRMED";
}

export function getAdminBookingPaymentStatus(
  booking: AdminBooking,
): AdminPaymentStatusFilter {
  return booking.paymentStatus ?? "N_A";
}

export function formatAdminBookingStatusLabel(
  status: AdminBookingStatusFilter,
): string {
  if (status === "ALL") {
    return "All Status";
  }

  return formatEnumLabel(status);
}

export function formatAdminPaymentStatusLabel(
  status: AdminPaymentStatusFilter,
): string {
  if (status === "ALL") {
    return "All Payment Status";
  }

  if (status === "N_A") {
    return "N/A";
  }

  return formatEnumLabel(status);
}

export function formatAdminPaymentMethodLabel(
  method?: AdminBooking["paymentMethod"],
): string {
  return method ? formatEnumLabel(method) : "N/A";
}

export function formatAdminVehicleTypeLabel(
  vehicleType: AdminBooking["vehicleType"],
): string {
  if (vehicleType === "TWO_WHEELER") {
    return "Two-Wheeler";
  }

  return "Four-Wheeler";
}

export function formatAdminBookingCurrency(amount: number): string {
  return `Rs. ${Number(amount).toFixed(2)}`;
}

export function formatAdminBookingDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAdminBookingDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAdminBookingTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAdminBookingTimeRange(
  startTime?: string | null,
  endTime?: string | null,
): string {
  return `${formatAdminBookingTime(startTime)} - ${formatAdminBookingTime(endTime)}`;
}

export function formatAdminBookingDuration(
  startTime?: string | null,
  endTime?: string | null,
): string {
  if (!startTime || !endTime) {
    return "-";
  }

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return "-";
  }

  const totalMinutes = Math.round((end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${minutes} min`;
}

export function truncateAdminBookingId(id: string): string {
  if (id.length <= 10) {
    return id;
  }

  return `${id.slice(0, 8)}...`;
}

export function getAdminBookingCustomerName(booking: AdminBooking): string {
  return (
    booking.driverName ??
    booking.customerName ??
    (booking.walkIn ? "Walk-in customer" : "Unknown Driver")
  );
}

export function getAdminBookingCustomerPhone(booking: AdminBooking): string {
  return booking.customerPhone ?? "No phone";
}

export function getAdminBookingStatusTone(
  status: AdminBookingStatusFilter,
): AdminBookingTone {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "PENDING":
    case "CONFIRMED":
    case "OCCUPIED":
      return "secondary";
    case "ALL":
      return "outline";
  }
}

export function getAdminPaymentStatusTone(
  status: AdminPaymentStatusFilter,
): AdminBookingTone {
  switch (status) {
    case "SUCCESS":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    case "N_A":
    case "ALL":
      return "outline";
  }
}

export function formatAdminBookingResultCount(count: number): string {
  return `${count} ${count === 1 ? "result" : "results"}`;
}

function getAdminBookingSearchText(booking: AdminBooking): string {
  return [
    booking.bookingId,
    booking.customerName,
    booking.customerPhone,
    booking.driverId,
    booking.driverName,
    booking.parkingLocationId,
    booking.parkingLocationName,
    booking.paymentId,
    booking.paymentMethod,
    booking.paymentStatus,
    booking.slotId,
    booking.slotNumber,
    booking.slotStatus,
    booking.status,
    booking.vehicleNumber,
    booking.vehicleType,
    booking.walkIn ? "walk-in" : "online",
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
}

function getDateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}
