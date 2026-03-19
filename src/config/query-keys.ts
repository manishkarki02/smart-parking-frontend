export const queryKeys = {
  parking: {
    all: ["parking", "slots"] as const,
    nearby: (lat: number, lng: number) =>
      ["parking", "nearby", lat, lng] as const,
    thamelNearby: (lat: number, lng: number, max: number) =>
      ["parking", "thamel-nearby", lat, lng, max] as const,
  },
  booking: {
    my: ["booking", "my"] as const,
    admin: ["booking", "admin"] as const,
  },
  vendor: {
    myLocations: ["vendor", "parking", "my"] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    vendors: ["admin", "vendors"] as const,
    drivers: ["admin", "drivers"] as const,
    bookings: ["admin", "bookings"] as const,
  },
} as const;
