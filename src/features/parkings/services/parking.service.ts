import createApi from "@/common/utils/api";
import type { ApiResponse } from "@/common/types/api.types";
import type {
  ParkingLocation,
  ParkingSlot,
  ParkingSlotStatus,
  ParkingSlotVehicleType,
} from "../types/parking.types";
import { API_BASE, PARKING_ROUTES } from "@/config/api-routes";

const parkingApi = createApi(API_BASE.PARKING);

export async function getAllSlots(): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation[]>>(
    PARKING_ROUTES.LIST,
    {
      params: {
        area: "thamel",
        available: true,
      },
    },
  );
  return response.data.data ?? [];
}

export async function getParkingById(
  id: number | string,
): Promise<ParkingLocation> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation>>(
    PARKING_ROUTES.BY_ID(id),
  );
  return response.data.data;
}

export async function getVendorSlots(
  id: number | string,
): Promise<ParkingSlot[]> {
  const response = await parkingApi.get<ApiResponse<ParkingSlot[]>>(
    PARKING_ROUTES.VENDOR_SLOTS(id),
  );
  return response.data.data ?? [];
}

export async function getParkingSlots(
  id: number | string,
  vehicleType?: ParkingSlotVehicleType,
): Promise<ParkingSlot[]> {
  const response = await parkingApi.get<ApiResponse<ParkingSlot[]>>(
    PARKING_ROUTES.SLOTS(id),
    {
      params: vehicleType ? { vehicleType } : undefined,
    },
  );
  return response.data.data ?? [];
}

export async function updateParkingSlotStatus({
  parkingLocationId,
  slotId,
  status,
}: {
  parkingLocationId: string;
  slotId: string;
  status: Extract<ParkingSlotStatus, "AVAILABLE" | "MAINTENANCE">;
}): Promise<ParkingSlot> {
  const response = await parkingApi.patch<ApiResponse<ParkingSlot>>(
    PARKING_ROUTES.SLOT_STATUS(parkingLocationId, slotId),
    { status },
  );
  return response.data.data;
}

export async function getNearby(
  lat: number,
  lng: number,
): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation>>(PARKING_ROUTES.NEAREST, {
    params: {
      lat,
      lng,
    },
  });
  const data = response.data.data;
  return data ? [data] : [];
}

export async function getThamelNearby(
  lat: number,
  lng: number,
  limit = 5,
): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation[]>>(PARKING_ROUTES.NEARBY, {
    params: {
      lat,
      lng,
      limit,
    },
  });
  return response.data.data ?? [];
}
