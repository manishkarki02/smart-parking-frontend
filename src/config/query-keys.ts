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
    root: () => ["BOOKINGS"] as const,
    all: () => queryKeys.bookings.root(),
    meRoot: () => [...queryKeys.bookings.root(), "ME"] as const,
    me: () => queryKeys.bookings.meRoot(),
    vendorRoot: () => [...queryKeys.bookings.root(), "VENDOR"] as const,
    vendorList: (params?: {
      search?: string;
      page?: number;
      locationId?: string;
      status?: string;
    }) =>
      [...queryKeys.bookings.vendorRoot(), params ?? {}] as const,
    vendor: (params?: {
      search?: string;
      page?: number;
      locationId?: string;
      status?: string;
    }) => queryKeys.bookings.vendorList(params),
    byId: (id: number | string) =>
      [...queryKeys.bookings.root(), "DETAIL", id] as const,
  },

  // ─── Vendor ──────────────────────────────────────────────────────────────────
  vendor: {
    root: () => ["VENDOR"] as const,
    all: () => queryKeys.vendor.root(),
    dashboardRoot: () => [...queryKeys.vendor.root(), "DASHBOARD"] as const,
    dashboard: () => queryKeys.vendor.dashboardRoot(),
  },

  // ─── Users ───────────────────────────────────────────────────────────────────
  users: {
    root: () => ["USERS"] as const,
    meRoot: () => [...queryKeys.users.root(), "ME"] as const,
    me: () => queryKeys.users.meRoot(),
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    root: () => ["ADMIN"] as const,
    all: () => queryKeys.admin.root(),
    dashboardRoot: () => [...queryKeys.admin.root(), "DASHBOARD"] as const,
    dashboard: () => queryKeys.admin.dashboardRoot(),
    bookingsRoot: () => [...queryKeys.admin.root(), "BOOKINGS"] as const,
    bookingsList: (params?: { search?: string; page?: number }) =>
      [...queryKeys.admin.bookingsRoot(), params ?? {}] as const,
    bookings: (params?: { search?: string; page?: number }) =>
      queryKeys.admin.bookingsList(params),
    usersRoot: () => [...queryKeys.admin.root(), "USERS"] as const,
    usersList: (role: "ALL" | "VENDOR" | "DRIVER" = "ALL") =>
      [...queryKeys.admin.usersRoot(), "LIST", { role }] as const,
    users: (role?: "VENDOR" | "DRIVER") =>
      queryKeys.admin.usersList(role ?? "ALL"),
    vendorsRoot: () => [...queryKeys.admin.usersRoot(), "VENDORS"] as const,
    vendorsList: (params?: { search?: string; page?: number }) =>
      [...queryKeys.admin.vendorsRoot(), params ?? {}] as const,
    vendors: (params?: { search?: string; page?: number }) =>
      queryKeys.admin.vendorsList(params),
    driversRoot: () => [...queryKeys.admin.usersRoot(), "DRIVERS"] as const,
    driversList: (params?: { search?: string; page?: number }) =>
      [...queryKeys.admin.driversRoot(), params ?? {}] as const,
    drivers: (params?: { search?: string; page?: number }) =>
      queryKeys.admin.driversList(params),
  },

  // ─── Payment ─────────────────────────────────────────────────────────────────
  payment: {
    khaltiInitiate: () => ["PAYMENT", "KHALTI_INITIATE"] as const,
    khaltiVerify: () => ["PAYMENT", "KHALTI_VERIFY"] as const,
    adminSummary: (params?: {
      fromDate?: string;
      toDate?: string;
    }) => ["PAYMENT", "ADMIN", "SUMMARY", params ?? {}] as const,
    adminList: (params?: {
      search?: string;
      status?: string;
      method?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      size?: number;
    }) => ["PAYMENT", "ADMIN", "LIST", params ?? {}] as const,
    adminDetail: (paymentId?: string | null) =>
      ["PAYMENT", "ADMIN", "DETAIL", paymentId ?? "NONE"] as const,
    driverList: (params?: {
      search?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      size?: number;
    }) => ["PAYMENT", "DRIVER", "LIST", params ?? {}] as const,
    driverDetail: (paymentId?: string | null) =>
      ["PAYMENT", "DRIVER", "DETAIL", paymentId ?? "NONE"] as const,
  },
} as const;
