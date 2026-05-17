/**
 * Central API Route Constants
 */

// ─── API Base Paths ───────────────────────────────────────────────────────────
export const API_BASE = {
  AUTH: "/auth",
  PARKING: "/parking",
  BOOKINGS: "/bookings",
  VENDORS: "/vendors",
  ADMIN: "/admin",
  PAYMENT: "/payment",
} as const;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  REGISTER: "/register",
  LOGIN: "/login",
} as const;

// ─── Parking ──────────────────────────────────────────────────────────────────
export const PARKING_ROUTES = {
  AVAILABLE_SLOTS: "/areas/thamel/available-slots",
  NEAREST: "/areas/thamel/nearest",
  THAMEL_NEARBY: "/areas/thamel-nearby",
} as const;

// ─── Booking ──────────────────────────────────────────────────────────────────
export const BOOKING_ROUTES = {
  CREATE: "/create",
  MY_BOOKINGS: "/mybookings",
} as const;

// ─── Vendor ───────────────────────────────────────────────────────────────────
export const VENDOR_ROUTES = {
  ADD_PARKING: "/addparking",
  MY_PARKING: "/view/parking-locations",

  UPDATE_SLOTS: (id: number | string) =>
    `/parking-locations/${id}/available-slots`,

  UPDATE_PARKING: (id: number | string) => `/updateparking/${id}`,

  DASHBOARD: "/dashboard",
  DASHBOARD_SUMMARY: "/dashboard/summary",
} as const;

// ─── Admin ────────────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  BOOKINGS: "/bookings",
  VENDORS: "/vendors",
  DRIVERS: "/drivers",
} as const;

// ─── Payment ──────────────────────────────────────────────────────────────────
export const PAYMENT_ROUTES = {
  KHALTI_INITIATE: "/khalti/initiate",
  KHALTI_VERIFY: "/khalti/verify",
} as const;