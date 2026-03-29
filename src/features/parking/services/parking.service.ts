import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { ParkingLocation } from "../types/parking.types";

export async function getAllSlots(): Promise<ParkingLocation[]> {
  const response = await api.get<ApiResponse<ParkingLocation[]>>("/parking/slots");
  console.log(response.data)
  return response.data.data ?? [];
}

export async function getNearby(
  lat: number,
  lng: number
): Promise<ParkingLocation[]> {
  const response = await api.get<ApiResponse<ParkingLocation>>("/parking/nearby", {
    params: {
      latitude: lat,
      longitude: lng,
    },
  });
  // /parking/nearby returns a single ParkingLocationResponseDto wrapped in data.
  // getNearby is expected to return an array of ParkingLocation.
  const data = response.data.data;
  return data ? [data] : [];
}

export async function getThamelNearby(lat: number, lng: number): Promise<ParkingLocation[]> {
  const response = await api.get<ApiResponse<ParkingLocation[]>>("/parking/thamel-nearby", {
    params: {
      latitude: lat,
      longitude: lng,
    },
  });
  return response.data.data ?? [];
}
