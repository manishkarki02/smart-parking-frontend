import createApi from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { ParkingLocation } from "../types/parking.types";

const slotsApi = createApi("/parking");

export async function getAllSlots(): Promise<ParkingLocation[]> {
  const response = await slotsApi.get<ApiResponse<ParkingLocation[]>>("/slots");
  console.log(response.data)
  return response.data.data ?? [];
}

export async function getNearby(
  lat: number,
  lng: number
): Promise<ParkingLocation[]> {
  const response = await slotsApi.get<ApiResponse<ParkingLocation>>("/nearby", {
    params: {
      latitude: lat,
      longitude: lng,
    },
  });
  const data = response.data.data;
  return data ? [data] : [];
}

export async function getThamelNearby(lat: number, lng: number): Promise<ParkingLocation[]> {
  const response = await slotsApi.get<ApiResponse<ParkingLocation[]>>("/thamel-nearby", {
    params: {
      latitude: lat,
      longitude: lng,
    },
  });
  return response.data.data ?? [];
}
