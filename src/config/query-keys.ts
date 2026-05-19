export const queryKeys = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    login: () => ["LOGIN"] as const,
    register: () => ["REGISTER"] as const,
  },

  // ─── Parking ────────────────────────────────────────────────────────────────
  parking: {
    all: (filters?: { area?: string; available?: boolean }) =>
      ["PARKING", "LIST", filters ?? {}] as const,
    available: (area = "thamel") =>
      ["PARKING", "LIST", { area, available: true }] as const,
    nearest: (lat: number, lng: number) =>
      ["PARKING", "NEAREST", { lat, lng }] as const,
    nearby: (lat: number, lng: number, limit = 5) =>
      ["PARKING", "NEARBY", { lat, lng, limit }] as const,
    mine: () => ["PARKING", "MINE"] as const,
    detail: (id: number | string) => ["PARKING", "DETAIL", id] as const,
  },

  // ─── Bookings ────────────────────────────────────────────────────────────────
  bookings: {
    all: () => ["BOOKINGS"] as const,
    me: () => ["BOOKINGS", "ME"] as const,
    byId: (id: number | string) => ["BOOKINGS", "DETAIL", id] as const,
  },

  // ─── Vendor ──────────────────────────────────────────────────────────────────
  vendor: {
    all: () => ["VENDOR"] as const,
    dashboard: () => ["VENDOR", "DASHBOARD"] as const,
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    all: () => ["ADMIN"] as const,
    dashboard: () => ["ADMIN", "DASHBOARD"] as const,
    bookings: () => ["ADMIN", "BOOKINGS"] as const,
    users: (role?: "VENDOR" | "DRIVER") => ["ADMIN", "USERS", { role }] as const,
    vendors: () => ["ADMIN", "USERS", { role: "VENDOR" }] as const,
    drivers: () => ["ADMIN", "USERS", { role: "DRIVER" }] as const,
  },

  // ─── Payment ─────────────────────────────────────────────────────────────────
  payment: {
    khaltiInitiate: () => ["PAYMENT", "KHALTI_INITIATE"] as const,
    khaltiVerify: () => ["PAYMENT", "KHALTI_VERIFY"] as const,
  },
} as const;
