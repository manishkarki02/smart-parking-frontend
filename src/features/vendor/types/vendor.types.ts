export interface ParkingLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalFourWheelerSlots: number;
  totalTwoWheelerSlots: number;
  fourWheelerRatePerHour: number;
  twoWheelerRatePerHour: number;
}

export type VendorDashboardSlotStats = {
  total: number;
  available: number;
  occupied: number;
};

export type VendorDashboardLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  twoWheelerRatePerHour?: number;
  fourWheelerRatePerHour?: number;
  vendorName?: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  twoWheelerSlots: VendorDashboardSlotStats;
  fourWheelerSlots: VendorDashboardSlotStats;
};

export type VendorDashboardVendor = {
  id: string;
  name: string;
  email: string;
  approved: boolean;
};

export type VendorDashboardData = {
  totalParkingLocations: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  twoWheelerSlots: VendorDashboardSlotStats;
  fourWheelerSlots: VendorDashboardSlotStats;
  locations: VendorDashboardLocation[];
  vendor?: VendorDashboardVendor;
};
