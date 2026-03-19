import type { ParkingLocation } from "@/features/parking/types/parking.types";
import type { BookingResponse } from "@/features/booking/types/booking.types";
import type {
  AdminStats,
  AdminUser,
  AdminBooking,
} from "@/features/admin/types/admin.types";

// ─── Parking Locations ───
export const mockParkingLocations: ParkingLocation[] = [
  {
    id: 1,
    name: "Thamel Parking Zone A",
    address: "Thamel, Kathmandu",
    latitude: 27.7172,
    longitude: 85.3128,
    availableSlots: 35,
    vendorName: "Kathmandu Parking Vendor",
  },
  {
    id: 2,
    name: "New Road Parking",
    address: "New Road, Kathmandu",
    latitude: 27.71,
    longitude: 85.32,
    availableSlots: 12,
    vendorName: "City Parking Co.",
  },
  {
    id: 3,
    name: "Durbar Marg Parking",
    address: "Durbar Marg, Kathmandu",
    latitude: 27.7125,
    longitude: 85.319,
    availableSlots: 28,
    vendorName: "Premier Parking Nepal",
  },
  {
    id: 4,
    name: "Lazimpat Basement Parking",
    address: "Lazimpat, Kathmandu",
    latitude: 27.7228,
    longitude: 85.3225,
    availableSlots: 5,
    vendorName: "Kathmandu Parking Vendor",
  },
  {
    id: 5,
    name: "Patan Gate Parking",
    address: "Patan Dhoka, Lalitpur",
    latitude: 27.6727,
    longitude: 85.3245,
    availableSlots: 0,
    vendorName: "Lalitpur Parking Services",
  },
  {
    id: 6,
    name: "Basantapur Parking",
    address: "Basantapur, Kathmandu",
    latitude: 27.7045,
    longitude: 85.3072,
    availableSlots: 7,
    vendorName: "Heritage Parking",
  },
];

// ─── Bookings ───
export const mockBookings: BookingResponse[] = [
  {
    bookingId: 1001,
    parkingName: "Thamel Parking Zone A",
    startTime: "2026-03-20T09:00:00",
    endTime: "2026-03-20T12:00:00",
    status: "CONFIRMED",
    totalAmount: 150,
    message: "Success",
  },
  {
    bookingId: 1002,
    parkingName: "New Road Parking",
    startTime: "2026-03-21T14:00:00",
    endTime: "2026-03-21T18:00:00",
    status: "PENDING",
    totalAmount: 200,
    message: "Success",
  },
  {
    bookingId: 1003,
    parkingName: "Durbar Marg Parking",
    startTime: "2026-03-18T08:00:00",
    endTime: "2026-03-18T10:00:00",
    status: "COMPLETED",
    totalAmount: 100,
    message: "Success",
  },
  {
    bookingId: 1004,
    parkingName: "Lazimpat Basement Parking",
    startTime: "2026-03-19T16:00:00",
    endTime: "2026-03-19T20:00:00",
    status: "CANCELLED",
    totalAmount: 200,
    message: "Success",
  },
];

// ─── Admin Stats ───
export const mockAdminStats: AdminStats = {
  totalBookings: 128,
  totalVendors: 12,
  totalDrivers: 245,
};

// ─── Admin Users ───
export const mockVendors: AdminUser[] = [
  { id: 1, name: "Kathmandu Parking Vendor", email: "vendor1@gmail.com", phone: "9841000001", role: "VENDOR" },
  { id: 2, name: "City Parking Co.", email: "vendor2@gmail.com", phone: "9841000002", role: "VENDOR" },
  { id: 3, name: "Premier Parking Nepal", email: "vendor3@gmail.com", phone: "9841000003", role: "VENDOR" },
  { id: 4, name: "Lalitpur Parking Services", email: "vendor4@gmail.com", phone: "9841000004", role: "VENDOR" },
  { id: 5, name: "Heritage Parking", email: "vendor5@gmail.com", phone: "9841000005", role: "VENDOR" },
];

export const mockDrivers: AdminUser[] = [
  { id: 10, name: "Ram Sharma", email: "ram@gmail.com", phone: "9800000001", role: "DRIVER" },
  { id: 11, name: "Sita Devi", email: "sita@gmail.com", phone: "9800000002", role: "DRIVER" },
  { id: 12, name: "Hari Prasad", email: "hari@gmail.com", phone: "9800000003", role: "DRIVER" },
  { id: 13, name: "Gita Kumari", email: "gita@gmail.com", phone: "9800000004", role: "DRIVER" },
  { id: 14, name: "Bikash Thapa", email: "bikash@gmail.com", phone: "9800000005", role: "DRIVER" },
  { id: 15, name: "Anita Rai", email: "anita@gmail.com", phone: "9800000006", role: "DRIVER" },
  { id: 16, name: "Manish Poudel", email: "manish@gmail.com", phone: "9800000007", role: "DRIVER" },
];

// ─── Admin Bookings ───
export const mockAdminBookings: AdminBooking[] = [
  {
    id: 1001,
    user: { name: "Ram Sharma", email: "ram@gmail.com" },
    parkingLocation: { name: "Thamel Parking Zone A", address: "Thamel, Kathmandu" },
    startTime: "2026-03-20T09:00:00",
    endTime: "2026-03-20T12:00:00",
    status: "CONFIRMED",
    totalAmount: 150,
  },
  {
    id: 1002,
    user: { name: "Sita Devi", email: "sita@gmail.com" },
    parkingLocation: { name: "New Road Parking", address: "New Road, Kathmandu" },
    startTime: "2026-03-21T14:00:00",
    endTime: "2026-03-21T18:00:00",
    status: "PENDING",
    totalAmount: 200,
  },
  {
    id: 1003,
    user: { name: "Hari Prasad", email: "hari@gmail.com" },
    parkingLocation: { name: "Durbar Marg Parking", address: "Durbar Marg, Kathmandu" },
    startTime: "2026-03-18T08:00:00",
    endTime: "2026-03-18T10:00:00",
    status: "COMPLETED",
    totalAmount: 100,
  },
  {
    id: 1004,
    user: { name: "Gita Kumari", email: "gita@gmail.com" },
    parkingLocation: { name: "Lazimpat Basement Parking", address: "Lazimpat, Kathmandu" },
    startTime: "2026-03-19T16:00:00",
    endTime: "2026-03-19T20:00:00",
    status: "CANCELLED",
    totalAmount: 200,
  },
  {
    id: 1005,
    user: { name: "Bikash Thapa", email: "bikash@gmail.com" },
    parkingLocation: { name: "Patan Gate Parking", address: "Patan Dhoka, Lalitpur" },
    startTime: "2026-03-22T10:00:00",
    endTime: "2026-03-22T14:00:00",
    status: "CONFIRMED",
    totalAmount: 200,
  },
  {
    id: 1006,
    user: { name: "Anita Rai", email: "anita@gmail.com" },
    parkingLocation: { name: "Basantapur Parking", address: "Basantapur, Kathmandu" },
    startTime: "2026-03-23T07:00:00",
    endTime: "2026-03-23T09:00:00",
    status: "PENDING",
    totalAmount: 100,
  },
];
