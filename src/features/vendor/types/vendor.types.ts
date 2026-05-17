export interface ParkingLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSlots: number;
}

export type VendorDashboardSlotStats = {
  total: number;
  available: number;
  occupied: number;
};

export type VendorDashboardLocation = {
  id: number;
  name: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  twoWheelerSlots: VendorDashboardSlotStats;
  fourWheelerSlots: VendorDashboardSlotStats;
};

export type VendorDashboardData = {
  totalParkingLocations: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  twoWheelerSlots: VendorDashboardSlotStats;
  fourWheelerSlots: VendorDashboardSlotStats;
  locations: VendorDashboardLocation[];
};
