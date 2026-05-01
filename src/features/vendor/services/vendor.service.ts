import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { ParkingLocation } from "@/features/parking/types/parking.types";
import type { ParkingLocationRequest } from "../types/vendor.types";
import { VENDOR_ROUTES } from "@/common/constants/api-routes";

export async function addParkingLocation(
  data: ParkingLocationRequest
): Promise<ParkingLocation> {
  const response = await api.post<ApiResponse<ParkingLocation>>(VENDOR_ROUTES.ADD_PARKING, data);
  return response.data.data;
}

export async function getMyParkingLocations(): Promise<ParkingLocation[]> {
  const response = await api.get<ApiResponse<ParkingLocation[]>>(VENDOR_ROUTES.MY_PARKING);
  return response.data.data ?? [];
}

export async function updateAvailableSlots(
  id: number,
  newAvailableSlots: number
): Promise<void> {
  await api.put<ApiResponse<null>>(VENDOR_ROUTES.UPDATE_PARKING(id), null, {
    params: {
      newAvailableSlots,
    },
  });
}
