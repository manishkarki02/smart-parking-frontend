export interface AdminBooking {
  bookingId: string;
  cancelledAt?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  message?: string | null;
  paidAt?: string | null;
  parkingLocationId: string;
  parkingLocationName: string;
  paymentId?: string | null;
  paymentMethod?: "CASH" | "KHALTI" | "ESEWA" | null;
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED" | null;
  slotId: string;
  slotNumber: string;
  slotStatus?: "AVAILABLE" | "RESERVED" | "BOOKED" | "OCCUPIED" | "MAINTENANCE";
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  vehicleNumber?: string | null;
  vehicleType: "TWO_WHEELER" | "FOUR_WHEELER";
  walkIn: boolean;
}
