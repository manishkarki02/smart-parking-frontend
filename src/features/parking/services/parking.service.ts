import createApi from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { ParkingLocation } from "../types/parking.types";
import { API_BASE, PARKING_ROUTES } from "@/common/constants/api-routes";

const parkingApi = createApi(API_BASE.PARKING);

export async function getAllSlots(): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation[]>>(PARKING_ROUTES.AVAILABLE_SLOTS);
  return response.data.data ?? [];
}

export async function getNearby(
  lat: number,
  lng: number
): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation>>(PARKING_ROUTES.NEAREST, {
    params: {
      latitude: lat,
      longitude: lng,
    },
  });
  const data = response.data.data;
  return data ? [data] : [];
}

export async function getThamelNearby(lat: number, lng: number): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation[]>>(PARKING_ROUTES.THAMEL_NEARBY, {
    params: {
      latitude: lat,
      longitude: lng,
    },
  });
  return response.data.data ?? [];
}
