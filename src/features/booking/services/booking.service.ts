import type { ApiResponse } from "@/common/types/api.types";
import type { BookingRequest, BookingResponse } from "../types/booking.types";
import createApi from "@/lib/api";
import { API_BASE, BOOKING_ROUTES } from "@/common/constants/api-routes";

const bookingApi = createApi(API_BASE.BOOKINGS)

export async function createBooking(
  data: BookingRequest
): Promise<BookingResponse> {
  const response = await bookingApi.post<ApiResponse<BookingResponse>>(BOOKING_ROUTES.CREATE, data);
  return response.data.data;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const response = await bookingApi.get<ApiResponse<BookingResponse[]>>(BOOKING_ROUTES.MY_BOOKINGS);
  return response.data.data ?? [];
}
