export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalFourWheelerSlots?: number;
  availableFourWheelerSlots?: number;
  totalTwoWheelerSlots?: number;
  availableTwoWheelerSlots?: number;
  totalSlots?: number;
  availableSlots: number;
  twoWheelerRatePerHour?: number;
  fourWheelerRatePerHour?: number;
  distance?: number;
  vendorId?: string;
  vendorName: string;
  imageUrl?: string | null;
}

export type ParkingSlotStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "BOOKED"
  | "OCCUPIED"
  | "MAINTENANCE";

export type ParkingSlotVehicleType = "TWO_WHEELER" | "FOUR_WHEELER";

export interface ParkingSlot {
  id: string;
  parkingLocationId: string;
  parkingLocationName: string;
  slotNumber: string;
  vehicleType: ParkingSlotVehicleType;
  status: ParkingSlotStatus;
  activeBooking?: ActiveBookingSummary;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface ActiveBookingSummary {
  bookingId: string;
  driverName?: string;
  customerName?: string;
  customerPhone?: string;
  vehicleNumber?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalAmount?: number;
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED";
  paymentMethod?: "CASH" | "KHALTI" | "ESEWA";
}
