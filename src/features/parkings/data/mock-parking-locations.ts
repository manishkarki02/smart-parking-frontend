import type { ParkingLocation } from "../types/parking.types";

export const mockParkingLocations: ParkingLocation[] = [
  {
    id: 9001,
    name: "Thamel Central Parking",
    address: "Tridevi Marg, Thamel, Kathmandu",
    latitude: 27.7149,
    longitude: 85.3124,
    availableSlots: 12,
    distance: 0.4,
    vendorName: "Kathmandu Parking Co.",
  },
  {
    id: 9002,
    name: "Durbar Marg Secure Lot",
    address: "Durbar Marg, near Narayanhiti Palace Museum",
    latitude: 27.7128,
    longitude: 85.3174,
    availableSlots: 6,
    distance: 1.1,
    vendorName: "Metro Park Services",
  },
  {
    id: 9003,
    name: "Lazimpat Plaza Parking",
    address: "Lazimpat Road, Kathmandu",
    latitude: 27.7207,
    longitude: 85.3201,
    availableSlots: 3,
    distance: 1.8,
    vendorName: "CitySlot Nepal",
  },
  {
    id: 9004,
    name: "Kamaladi Business Park",
    address: "Kamaladi, Kathmandu",
    latitude: 27.7095,
    longitude: 85.3189,
    availableSlots: 0,
    distance: 1.6,
    vendorName: "Smart Bay Operators",
  },
];
