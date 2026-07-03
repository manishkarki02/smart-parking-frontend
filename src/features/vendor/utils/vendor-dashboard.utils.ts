import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import type { VendorDashboardLocation } from "@/features/vendor/types/vendor.types";

export function occupancyPercent(occupied: number, total: number) {
  return total > 0 ? Math.round((occupied / total) * 100) : 0;
}

export function ratioPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function toParkingLocation(
  location: VendorDashboardLocation,
): ParkingLocation {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
    totalFourWheelerSlots: location.fourWheelerSlots.total,
    availableFourWheelerSlots: location.fourWheelerSlots.available,
    totalTwoWheelerSlots: location.twoWheelerSlots.total,
    availableTwoWheelerSlots: location.twoWheelerSlots.available,
    totalSlots: location.totalSlots,
    availableSlots: location.availableSlots,
    twoWheelerRatePerHour: location.twoWheelerRatePerHour,
    fourWheelerRatePerHour: location.fourWheelerRatePerHour,
    vendorName: location.vendorName ?? "",
  };
}
