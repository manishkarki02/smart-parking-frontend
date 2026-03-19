export interface ParkingLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  availableSlots: number;
  distance?: number;
  vendorName: string;
}
