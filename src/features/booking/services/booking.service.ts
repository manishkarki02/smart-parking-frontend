import { mockBookings } from "@/mocks/data";
import type { BookingRequest, BookingResponse } from "../types/booking.types";

export async function createBooking(
  _data: BookingRequest
): Promise<BookingResponse> {
  return {
    bookingId: Date.now(),
    parkingName: "Mock Location",
    startTime: _data.startTime,
    endTime: _data.endTime,
    status: "CONFIRMED",
    totalAmount: 150,
    message: "Booking successful",
  };
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  return mockBookings;
}
