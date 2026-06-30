export interface ParkingLocation {
  id: number;
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
  vendorName: string;
}

export type ParkingSlotStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "MAINTENANCE";

export type ParkingSlotVehicleType = "TWO_WHEELER" | "FOUR_WHEELER";

export interface ParkingSlot {
  id: string;
  parkingLocationId: string;
  parkingLocationName: string;
  slotNumber: string;
  vehicleType: ParkingSlotVehicleType;
  status: ParkingSlotStatus;
}
