import type { VehicleType } from "@/domain/booking/booking.types";

export type SlotStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "BOOKED"
  | "OCCUPIED"
  | "MAINTENANCE";

export type { VehicleType };
