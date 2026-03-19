import { mockParkingLocations } from "@/mocks/data";
import type { ParkingLocation } from "../types/parking.types";

export async function getAllSlots(): Promise<ParkingLocation[]> {
  return mockParkingLocations;
}

export async function getNearby(
  _lat: number,
  _lng: number
): Promise<ParkingLocation[]> {
  // Return subset with mock distance
  return mockParkingLocations.slice(0, 3).map((p, i) => ({
    ...p,
    distance: (i + 1) * 0.5,
  }));
}

export async function getThamelNearby(): Promise<ParkingLocation[]> {
  return mockParkingLocations.slice(0, 2);
}
