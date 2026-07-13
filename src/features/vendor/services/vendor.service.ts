import type { ApiResponse } from "@/common/types/api.types";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import type {
  VendorBookingStatusRequest,
  BookingResponse,
} from "@/features/bookings/types/booking.types";
import type {
  WalkInBookingRequest,
  WalkInBookingResponse,
} from "@/features/bookings/types/walk-in-booking.types";
import type {
  ParkingLocationRequest,
  VendorDashboardData,
} from "../types/vendor.types";
import { API_BASE, PARKING_ROUTES, VENDOR_ROUTES } from "@/config/api-routes";
import createApi from "@/common/utils/api";

const parkingApi = createApi(API_BASE.PARKING);
const vendorApi = createApi(API_BASE.VENDORS);

export async function addParkingLocation(
  data: ParkingLocationRequest,
): Promise<ParkingLocation> {
  const response = await parkingApi.post<ApiResponse<ParkingLocation>>(
    PARKING_ROUTES.LIST,
    data,
  );
  return response.data.data;
}

export async function updateParkingLocation(
  id: number | string,
  data: ParkingLocationRequest,
): Promise<ParkingLocation> {
  const response = await parkingApi.put<ApiResponse<ParkingLocation>>(
    PARKING_ROUTES.BY_ID(id),
    data,
  );
  return response.data.data;
}

export async function getMyParkingLocations(): Promise<ParkingLocation[]> {
  const response = await parkingApi.get<ApiResponse<ParkingLocation[]>>(
    PARKING_ROUTES.MINE,
  );
  return response.data.data ?? [];
}

export async function updateAvailableSlots(
  id: number | string,
  newAvailableSlots: number,
): Promise<void> {
  await parkingApi.patch<ApiResponse<ParkingLocation>>(
    PARKING_ROUTES.SLOTS(id),
    {
      availableSlots: newAvailableSlots,
    },
  );
}

export async function deleteParkingLocation(
  id: number | string,
): Promise<void> {
  await parkingApi.delete<ApiResponse<void>>(PARKING_ROUTES.BY_ID(id));
}

export async function getVendorDashboard(): Promise<VendorDashboardData> {
  const response = await vendorApi.get<ApiResponse<VendorDashboardData>>(
    VENDOR_ROUTES.DASHBOARD,
  );
  return response.data.data;
}

export async function createWalkInBooking(
  data: WalkInBookingRequest,
): Promise<WalkInBookingResponse> {
  const response = await vendorApi.post<ApiResponse<WalkInBookingResponse>>(
    VENDOR_ROUTES.WALK_IN_BOOKING,
    data,
  );
  return response.data.data;
}

export async function updateVendorBookingStatus({
  bookingId,
  data,
}: {
  bookingId: string;
  data: VendorBookingStatusRequest;
}): Promise<BookingResponse> {
  const response = await vendorApi.put<ApiResponse<BookingResponse>>(
    VENDOR_ROUTES.BOOKING_STATUS(bookingId),
    data,
  );
  return response.data.data;
}
