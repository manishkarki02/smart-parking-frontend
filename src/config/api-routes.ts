/**
 * Central API Route Constants
 */

// ─── API Base Paths ───────────────────────────────────────────────────────────
export const API_BASE = {
  AUTH: "/auth",
  PARKING: "/parking-locations",
  BOOKINGS: "/bookings",
  VENDORS: "/vendors",
  ADMIN: "/admin",
  PAYMENT: "/payments",
} as const;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  REGISTER: "/register",
  LOGIN: "/login",
  REFRESH: "/refresh",
  LOGOUT: "/logout",
  LOGOUT_ALL: "/logout-all",
} as const;

// ─── Parking ──────────────────────────────────────────────────────────────────
export const PARKING_ROUTES = {
  LIST: "",
  MINE: "/mine",
  NEAREST: "/nearest",
  NEARBY: "/nearby",
  BY_ID: (id: number | string) => `/${id}`,
  SLOTS: (id: number | string) => `/${id}/slots`,
} as const;

// ─── Booking ──────────────────────────────────────────────────────────────────
export const BOOKING_ROUTES = {
  CREATE: "",
  ME: "/me",
  BY_ID: (id: number | string) => `/${id}`,
  STATUS: (id: number | string) => `/${id}/status`,
  CANCEL: (id: number | string) => `/${id}`,
} as const;

// ─── Vendor ───────────────────────────────────────────────────────────────────
export const VENDOR_ROUTES = {
  DASHBOARD: "/dashboard",
} as const;

// ─── Admin ────────────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  BOOKINGS: "/bookings",
  USERS: "/users",
  VENDORS: "/vendors",
  VENDOR_APPROVE: (id: number | string) => `/vendors/${id}/approve`,
  VENDOR_BY_ID: (id: number | string) => `/vendors/${id}`,
  USER_BAN: (id: number | string) => `/users/${id}/ban`,
  USER_UNBAN: (id: number | string) => `/users/${id}/unban`,
  USER_BY_ID: (id: number | string) => `/users/${id}`,
} as const;

// ─── Payment ──────────────────────────────────────────────────────────────────
export const PAYMENT_ROUTES = {
  KHALTI_INITIATE: "/khalti/initiate",
  KHALTI_VERIFY: "/khalti/verify",
} as const;
