import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { ParkingLocation } from "@/features/parking/types/parking.types";
import type { ParkingLocationRequest } from "../types/vendor.types";

export async function addParkingLocation(
  data: ParkingLocationRequest
): Promise<ParkingLocation> {
  const response = await api.post<ApiResponse<ParkingLocation>>("/vendor/addparking", data);
  return response.data.data;
}

export async function getMyParkingLocations(): Promise<ParkingLocation[]> {
  const response = await api.get<ApiResponse<ParkingLocation[]>>("/vendor/parking/my");
  return response.data.data ?? [];
}

export async function updateAvailableSlots(
  id: number,
  newAvailableSlots: number
): Promise<void> {
  await api.put<ApiResponse<null>>(`/vendor/parking/${id}/slots`, null, {
    params: {
      newAvailableSlots,
    },
  });
}
