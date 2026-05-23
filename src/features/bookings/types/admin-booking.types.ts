export interface AdminBooking {
  id: number;
  user: { name: string; email: string };
  parkingLocation: { name: string; address: string };
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
}
