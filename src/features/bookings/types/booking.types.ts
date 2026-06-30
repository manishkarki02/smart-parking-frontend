export interface BookingRequest {
  parkingLocationId: string;
  slotId: string;
  vehicleType: "TWO_WHEELER" | "FOUR_WHEELER";
  vehicleNumber: string;
  startTime: string;
  endTime: string;
}

export interface BookingResponse {
  bookingId: string;
  driverId?: string;
  driverName?: string;
  customerName?: string;
  customerPhone?: string;
  vehicleNumber?: string;
  walkIn: boolean;
  parkingLocationId: string;
  parkingLocationName: string;
  slotId: string;
  slotNumber: string;
  slotStatus?: "AVAILABLE" | "RESERVED" | "BOOKED" | "OCCUPIED" | "MAINTENANCE";
  vehicleType: "TWO_WHEELER" | "FOUR_WHEELER";
  status: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  message?: string;
  paymentId?: string;
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED";
  paymentMethod?: "CASH" | "KHALTI" | "ESEWA";
  paidAt?: string;
}

export interface BookingCancelResponse {
  bookingId: string;
  status: string;
  refundEligible: boolean;
  refundStatus?: string;
  refundAmount?: number;
  cancelledAt?: string;
  message: string;
}

export type VendorBookingAction = "CHECK_IN" | "COMPLETE";

export interface VendorBookingStatusRequest {
  action: VendorBookingAction;
}
