export interface AdminStats {
  totalBookings: number;
  totalVendors: number;
  totalDrivers: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface AdminBooking {
  id: number;
  user: { name: string; email: string };
  parkingLocation: { name: string; address: string };
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
}
