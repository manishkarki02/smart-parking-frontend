export const queryKeys = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    login: () => ["LOGIN"] as const,
    register: () => ["REGISTER"] as const,
  },

  // ─── Parking ────────────────────────────────────────────────────────────────
  parking: {
    all: () => ["PARKING"] as const,
    availableSlots: () => ["PARKING", "AVAILABLE_SLOTS"] as const,
    nearest: (lat: number, lng: number) =>
      ["PARKING", "NEAREST", { lat, lng }] as const,
    nearby: (lat: number, lng: number, radius?: number) =>
      ["PARKING", "NEARBY", { lat, lng, radius }] as const,
  },

  // ─── Bookings ────────────────────────────────────────────────────────────────
  bookings: {
    all: () => ["BOOKINGS"] as const,
    myBookings: () => ["BOOKINGS", "MY_BOOKINGS"] as const,
    byId: (id: number | string) => ["BOOKINGS", "DETAIL", id] as const,
  },

  // ─── Vendor ──────────────────────────────────────────────────────────────────
  vendor: {
    all: () => ["VENDOR"] as const,
    myParking: () => ["VENDOR", "MY_PARKING"] as const,
    addParking: () => ["VENDOR", "ADD_PARKING"] as const,
    parkingSlots: (id: number | string) =>
      ["VENDOR", "PARKING_SLOTS", id] as const,
    dashboard: () => ["VENDOR", "DASHBOARD"] as const,
    dashboardSummary: () => ["VENDOR", "DASHBOARD_SUMMARY"] as const,
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    all: () => ["ADMIN"] as const,
    dashboard: () => ["ADMIN", "DASHBOARD"] as const,
    bookings: () => ["ADMIN", "BOOKINGS"] as const,
    vendors: () => ["ADMIN", "VENDORS"] as const,
    drivers: () => ["ADMIN", "DRIVERS"] as const,
  },

  // ─── Payment ─────────────────────────────────────────────────────────────────
  payment: {
    khaltiInitiate: () => ["PAYMENT", "KHALTI_INITIATE"] as const,
    khaltiVerify: () => ["PAYMENT", "KHALTI_VERIFY"] as const,
  },
} as const;
