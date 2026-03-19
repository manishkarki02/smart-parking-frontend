export interface BookingRequest {
  parkingLocationId: number;
  startTime: string;
  endTime: string;
}

export interface BookingResponse {
  bookingId: number;
  parkingName: string;
  status: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  message: string;
}
