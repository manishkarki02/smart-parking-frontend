import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface LeafletSearchResult {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
}

interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const nominatimClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  headers: {
    "Accept-Language": "en",
  },
});

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const { data } = await nominatimClient.get("/reverse", {
    params: {
      format: "jsonv2",
      lat,
      lon: lng,
      zoom: 18,
      addressdetails: 1,
    },
  });

  return data?.display_name ?? "Unknown location";
}

async function searchLocations(query: string): Promise<LeafletSearchResult[]> {
  const { data } = await nominatimClient.get<NominatimSearchResult[]>(
    "/search",
    {
      params: {
        format: "jsonv2",
        q: query,
        limit: 6,
        addressdetails: 1,
      },
    },
  );

  return data.map((result) => ({
    placeId: String(result.place_id),
    label: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
  }));
}

export function useLeafletReverseGeocode(
  lat: number | undefined,
  lng: number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["leaflet-reverse-geocode", lat, lng],
    queryFn: () => reverseGeocode(lat!, lng!),
    enabled: enabled && lat != null && lng != null,
    staleTime: Infinity,
    retry: 1,
  });
}

export function useLeafletLocationSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["leaflet-location-search", trimmed],
    queryFn: () => searchLocations(trimmed),
    enabled: trimmed.length > 1,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
