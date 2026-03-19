import { mockParkingLocations } from "@/mocks/data";
import type { ParkingLocation } from "@/features/parking/types/parking.types";
import type { ParkingLocationRequest } from "../types/vendor.types";

export async function addParkingLocation(
  data: ParkingLocationRequest
): Promise<ParkingLocation> {
  return {
    id: Date.now(),
    ...data,
    availableSlots: data.totalSlots,
    vendorName: "Current Vendor",
  };
}

export async function getMyParkingLocations(): Promise<ParkingLocation[]> {
  return mockParkingLocations.slice(0, 3);
}

export async function updateAvailableSlots(
  _id: number,
  _newAvailableSlots: number
): Promise<void> {
  // no-op for mock
}
