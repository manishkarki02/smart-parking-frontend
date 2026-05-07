import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const geocodingClient = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
});

async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  const { data } = await geocodingClient.get("/geocode/json", {
    params: { latlng: `${lat},${lng}`, key: apiKey },
  });
  if (data.status !== "OK") throw new Error(`Geocoding failed: ${data.status}`);
  return data.results[0]?.formatted_address ?? "Unknown location";
}

export function useReverseGeocode(
  lat: number | undefined,
  lng: number | undefined,
  apiKey: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["reverse-geocode", lat, lng],
    queryFn: () => reverseGeocode(lat!, lng!, apiKey),
    enabled: enabled && lat != null && lng != null,
    staleTime: Infinity,
  });
}