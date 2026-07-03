export type KnownBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type BookingStatus = KnownBookingStatus | string;

export type VehicleType = "TWO_WHEELER" | "FOUR_WHEELER";
