import type { useGeolocation } from "@/common/hooks/maps/useGeolocation";

export type LatLng = {
  lat: number;
  lng: number;
};

export function getUserLocation(
  state: ReturnType<typeof useGeolocation>["state"],
): LatLng | null {
  if (state.status !== "located") return null;
  return { lat: state.lat, lng: state.lng };
}

export function calculateDistanceKm(from: LatLng, to: LatLng): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
