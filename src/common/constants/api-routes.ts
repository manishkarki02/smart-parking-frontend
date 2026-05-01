/**
 * Central API Route Constants
 * Base URL is handled by the Axios instance / Vite proxy — do NOT hardcode it here.
 * Usage:  import { API_ROUTES } from '@/common/constants/api-routes';
 *         axios.post(API_ROUTES.AUTH.LOGIN, body)
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
const AUTH_BASE = '/auth';

export const AUTH_ROUTES = {
  REGISTER: `${AUTH_BASE}/register`,
  LOGIN:    `${AUTH_BASE}/login`,
} as const;

// ─── Parking ──────────────────────────────────────────────────────────────────
const PARKING_BASE = '/parking';

export const PARKING_ROUTES = {
  /** GET all available Thamel parking locations */
  ALL_SLOTS:       `${PARKING_BASE}/slots`,

  /** GET nearest single parking spot
   *  Query params: latitude, longitude  */
  NEAREST:         `${PARKING_BASE}/nearby`,

  /** GET top-N nearest spots via Dijkstra
   *  Query params: latitude, longitude, maxSpots (default 5) */
  THAMEL_NEARBY:   `${PARKING_BASE}/thamel-nearby`,
} as const;

// ─── Booking ──────────────────────────────────────────────────────────────────
const BOOKING_BASE = '/booking';

export const BOOKING_ROUTES = {
  /** POST  — create a new booking (requires JWT) */
  CREATE:       `${BOOKING_BASE}/create`,

  /** GET   — fetch logged-in user's bookings (requires JWT) */
  MY_BOOKINGS:  `${BOOKING_BASE}/mybookings`,
} as const;

// ─── Vendor ───────────────────────────────────────────────────────────────────
const VENDOR_BASE = '/vendor';

export const VENDOR_ROUTES = {
  /** POST  — add a new parking location (VENDOR role) */
  ADD_PARKING:        `${VENDOR_BASE}/addparking`,

  /** GET   — get vendor's own parking locations (VENDOR role) */
  MY_PARKING:         `${VENDOR_BASE}/myparkinglocation`,

  /** PUT   — update available slots (VENDOR role)
   *  Path param :id  |  Query param: newAvailableSlots
   *  Usage: VENDOR_ROUTES.UPDATE_PARKING(id) */
  UPDATE_PARKING: (id: number | string) => `${VENDOR_BASE}/updateparking/${id}`,
} as const;

// ─── Admin ────────────────────────────────────────────────────────────────────
const ADMIN_BASE = '/admin';

export const ADMIN_ROUTES = {
  /** GET — system-wide stats: totalBookings, totalVendors, totalDrivers */
  DASHBOARD: `${ADMIN_BASE}/dashboard`,

  /** GET — all bookings in the system */
  BOOKINGS:  `${ADMIN_BASE}/bookings`,

  /** GET — all registered vendors */
  VENDORS:   `${ADMIN_BASE}/vendors`,

  /** GET — all registered drivers */
  DRIVERS:   `${ADMIN_BASE}/drivers`,
} as const;

// ─── Payment ──────────────────────────────────────────────────────────────────
const PAYMENT_BASE = '/payment';

export const PAYMENT_ROUTES = {
  /** POST — initiate a Khalti payment
   *  Body: { bookingId: number, paymentMethod: "KHALTI" | "CASH" } */
  KHALTI_INITIATE: `${PAYMENT_BASE}/khalti/initiate`,

  /** GET  — verify Khalti callback
   *  Query param: pidx */
  KHALTI_VERIFY:   `${PAYMENT_BASE}/khalti/verify`,
} as const;

// ─── Aggregated export (optional convenience) ─────────────────────────────────
export const API_ROUTES = {
  AUTH:    AUTH_ROUTES,
  PARKING: PARKING_ROUTES,
  BOOKING: BOOKING_ROUTES,
  VENDOR:  VENDOR_ROUTES,
  ADMIN:   ADMIN_ROUTES,
  PAYMENT: PAYMENT_ROUTES,
} as const;
