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
    nearbyGps: (lat: number, lng: number, limit = 5) =>
      ["PARKING", "NEARBY_GPS", { lat, lng, limit }] as const,
    thamelNearby: (lat: number, lng: number, limit = 5) =>
      ["PARKING", "THAMEL_NEARBY", { lat, lng, limit }] as const,
    mine: () => ["PARKING", "MINE"] as const,
    detail: (id: number | string) => ["PARKING", "DETAIL", id] as const,
    slotsForLocation: (id: number | string) =>
      ["PARKING", "SLOTS", id] as const,
    slots: (id: number | string, vehicleType?: string) =>
      ["PARKING", "SLOTS", id, vehicleType ?? "ALL"] as const,
    vendorSlots: (id: number | string) =>
      ["PARKING", "VENDOR_SLOTS", id] as const,
  },

  // ─── Bookings ────────────────────────────────────────────────────────────────
  bookings: {
    all: () => ["BOOKINGS"] as const,
    me: () => ["BOOKINGS", "ME"] as const,
    vendor: (params?: { search?: string; page?: number }) =>
      ["BOOKINGS", "VENDOR", params ?? {}] as const,
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
    bookings: (params?: { search?: string; page?: number }) =>
      ["ADMIN", "BOOKINGS", params ?? {}] as const,
    users: (role?: "VENDOR" | "DRIVER") => ["ADMIN", "USERS", { role }] as const,
    vendors: (params?: { search?: string; page?: number }) =>
      ["ADMIN", "USERS", { role: "VENDOR" }, params ?? {}] as const,
    drivers: (params?: { search?: string; page?: number }) =>
      ["ADMIN", "USERS", { role: "DRIVER" }, params ?? {}] as const,
  },

  // ─── Payment ─────────────────────────────────────────────────────────────────
  payment: {
    khaltiInitiate: () => ["PAYMENT", "KHALTI_INITIATE"] as const,
    khaltiVerify: () => ["PAYMENT", "KHALTI_VERIFY"] as const,
  },
} as const;
