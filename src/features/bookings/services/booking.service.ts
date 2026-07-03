import type { ApiResponse } from "@/common/types/api.types";
import type {
  BookingCancelResponse,
  BookingRequest,
  BookingResponse,
} from "../types/booking.types";
import createApi from "@/common/utils/api";
import type { PaginatedResult } from "@/common/types/pagination.types";
import { normalizePaginatedResponse } from "@/common/utils/api-response";
import { API_BASE, BOOKING_ROUTES, VENDOR_ROUTES } from "@/config/api-routes";

const bookingApi = createApi(API_BASE.BOOKINGS)
const vendorApi = createApi(API_BASE.VENDORS);

export interface BookingListParams {
  search?: string;
  page?: number;
  locationId?: string;
  status?: string;
}

export interface VendorBooking {
  id: string;
  bookingId?: string;
  driverId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  driverEmail?: string | null;
  driver?: {
    name?: string;
    email?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
  parkingLocationId: string;
  parkingLocationName: string;
  startTime: string;
  endTime?: string | null;
  slot?: string | number;
  slotNumber?: string | number;
  slotId?: string;
  slotStatus?: "AVAILABLE" | "RESERVED" | "BOOKED" | "OCCUPIED" | "MAINTENANCE";
  vehicleNumber?: string | null;
  vehicleType?: "TWO_WHEELER" | "FOUR_WHEELER";
  walkIn: boolean;
  status: string;
  totalAmount?: number;
  amount?: number;
  paymentId?: string | null;
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED" | string | null;
  paymentMethod?: "CASH" | "KHALTI" | "ESEWA" | string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type PaginatedBookings<TData> = PaginatedResult<TData>;

export async function createBooking(
  data: BookingRequest
): Promise<BookingResponse> {
  const response = await bookingApi.post<ApiResponse<BookingResponse>>(BOOKING_ROUTES.CREATE, data);
  return response.data.data;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const response = await bookingApi.get<ApiResponse<BookingResponse[]>>(BOOKING_ROUTES.ME);
  return response.data.data ?? [];
}

export async function getBookingById(
  id: number | string,
): Promise<BookingResponse> {
  const response = await bookingApi.get<ApiResponse<BookingResponse>>(
    BOOKING_ROUTES.BY_ID(id),
  );
  return response.data.data;
}

export async function getVendorBookings(
  params: BookingListParams = {},
): Promise<PaginatedBookings<VendorBooking>> {
  const response = await vendorApi.get<ApiResponse<unknown>>(VENDOR_ROUTES.BOOKINGS, {
    params: {
      search: params.search || undefined,
      page: params.page,
      locationId: params.locationId || undefined,
      status: params.status || undefined,
    },
  });
  return normalizePaginatedResponse<VendorBooking>(response.data.data);
}

export async function updateBookingStatus({
  id,
  status,
}: {
  id: number | string;
  status: string;
}): Promise<void> {
  await bookingApi.patch<ApiResponse<void>>(BOOKING_ROUTES.STATUS(id), {
    status,
  });
}

export async function cancelBooking(
  id: number | string,
): Promise<BookingCancelResponse> {
  const response = await bookingApi.put<ApiResponse<BookingCancelResponse>>(
    `${BOOKING_ROUTES.BY_ID(id)}/cancel`,
  );
  return response.data.data;
}
