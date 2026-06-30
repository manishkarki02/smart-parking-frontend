import type { BookingResponse } from "./booking.types";
import type { ParkingSlotVehicleType } from "@/features/parkings/types/parking.types";

export type WalkInPaymentMethod = "CASH" | "KHALTI" | "ESEWA";

export interface WalkInBookingRequest {
  parkingLocationId: string;
  slotId: string;
  vehicleType: ParkingSlotVehicleType;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  paymentMethod: WalkInPaymentMethod;
}

export type WalkInBookingResponse = BookingResponse;
