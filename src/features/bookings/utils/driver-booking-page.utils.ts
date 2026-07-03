import type { BookingResponse } from "@/features/bookings/types/booking.types";

export type DriverBookingStatusFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type DriverBookingPaymentFilter = "ALL" | "PENDING" | "SUCCESS" | "FAILED";
export type DriverBookingDateFilter = "ALL" | "TODAY" | "UPCOMING" | "PAST";

export const DRIVER_BOOKINGS_PAGE_SIZE = 10;

export function filterDriverBookings({
  bookings,
  search,
  statusFilter,
  paymentFilter,
  dateFilter,
}: {
  bookings: BookingResponse[];
  search: string;
  statusFilter: DriverBookingStatusFilter;
  paymentFilter: DriverBookingPaymentFilter;
  dateFilter: DriverBookingDateFilter;
}) {
  return bookings.filter((booking) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      [
        booking.bookingId,
        booking.customerName,
        booking.customerPhone,
        booking.driverName,
        booking.parkingLocationName,
        booking.slotNumber,
        booking.slotStatus,
        booking.status,
        booking.vehicleNumber,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));

    const matchesStatus =
      statusFilter === "ALL" || booking.status.toUpperCase() === statusFilter;
    const matchesPayment =
      paymentFilter === "ALL" ||
      (booking.paymentStatus ?? "PENDING").toUpperCase() === paymentFilter;
    const matchesDate = matchesDriverBookingDateFilter(booking, dateFilter);

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });
}

export function getDriverBookingStats(bookings: BookingResponse[]) {
  return bookings.reduce(
    (stats, booking) => {
      const status = booking.status.toUpperCase();
      const paymentStatus = booking.paymentStatus ?? "PENDING";
      if (status === "CONFIRMED") stats.active += 1;
      if (status === "PENDING") stats.upcoming += 1;
      if (status === "COMPLETED") stats.completed += 1;
      if (status === "CANCELLED") stats.cancelled += 1;
      if (paymentStatus !== "SUCCESS") stats.pendingPayment += 1;
      return stats;
    },
    {
      active: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      pendingPayment: 0,
    },
  );
}

export function canPayForDriverBooking(booking: BookingResponse) {
  const status = booking.status.toUpperCase();
  const paymentStatus = booking.paymentStatus ?? "PENDING";
  return (
    status !== "CANCELLED" &&
    status !== "COMPLETED" &&
    paymentStatus !== "SUCCESS"
  );
}

export function canCancelDriverBooking(booking: BookingResponse) {
  const status = booking.status.toUpperCase();
  return status === "PENDING" || status === "CONFIRMED";
}

export function shortDriverBookingId(value: string) {
  return `${value.slice(0, 8)}...`;
}

export function driverBookingPaymentStatusLabel(status?: string | null) {
  if (status === "SUCCESS") return "Paid";
  if (status === "FAILED") return "Failed";
  return "Pending";
}

export function formatDriverBookingDuration(booking: BookingResponse) {
  const start = new Date(booking.startTime).getTime();
  const end = new Date(booking.endTime).getTime();
  const durationMs = end - start;

  if (!Number.isFinite(durationMs) || durationMs <= 0) return "-";

  const minutes = Math.round(durationMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }
  if (hours > 0) return `${hours} hr`;
  return `${remainingMinutes} min`;
}

export function buildGoogleMapsDirectionsUrl({
  latitude,
  longitude,
  fallback,
}: {
  latitude?: number;
  longitude?: number;
  fallback: string;
}) {
  const destination =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
      ? `${latitude},${longitude}`
      : fallback;

  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function matchesDriverBookingDateFilter(
  booking: BookingResponse,
  filter: DriverBookingDateFilter,
) {
  if (filter === "ALL") return true;

  const start = new Date(booking.startTime);
  const now = new Date();

  if (filter === "TODAY") {
    return start.toDateString() === now.toDateString();
  }

  if (filter === "UPCOMING") {
    return start.getTime() >= now.getTime();
  }

  return start.getTime() < now.getTime();
}
