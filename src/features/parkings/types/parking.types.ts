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
