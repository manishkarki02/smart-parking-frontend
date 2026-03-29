import { api } from "@/lib/api";
import type { ApiResponse } from "@/common/types/api.types";
import type { BookingRequest, BookingResponse } from "../types/booking.types";

export async function createBooking(
  data: BookingRequest
): Promise<BookingResponse> {
  const response = await api.post<ApiResponse<BookingResponse>>("/booking/create", data);
  return response.data.data;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const response = await api.get<ApiResponse<BookingResponse[]>>("/booking/my");
  return response.data.data ?? [];
}
