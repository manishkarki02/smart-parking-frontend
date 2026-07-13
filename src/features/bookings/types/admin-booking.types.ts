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
  vendorId?: string | null;
  vendorName?: string | null;
  paymentId?: string | null;
  paymentMethod?: "CASH" | "KHALTI" | "ESEWA" | null;
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED" | null;
  slotId: string;
  slotNumber: string;
  slotStatus?: "AVAILABLE" | "RESERVED" | "BOOKED" | "OCCUPIED" | "MAINTENANCE";
  startTime: string;
  endTime: string;
  createdAt?: string | null;
  status: string;
  totalAmount: number;
  vehicleNumber?: string | null;
  vehicleType: "TWO_WHEELER" | "FOUR_WHEELER";
  walkIn: boolean;
}

export type AdminBookingStatusFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "OCCUPIED"
  | "COMPLETED"
  | "CANCELLED";

export type AdminPaymentStatusFilter =
  | "ALL"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "N_A";

export type AdminBookingFilters = {
  search: string;
  status: AdminBookingStatusFilter;
  paymentStatus: AdminPaymentStatusFilter;
  date: string | null;
  page: number;
  pageSize: number;
};

export type AdminBookingStats = {
  totalBookings: number;
  occupied: number;
  completed: number;
  cancelled: number;
};
