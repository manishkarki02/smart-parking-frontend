import { useQuery } from "@tanstack/react-query";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

type Location = {
  lat: number;
  lng: number;
};
async function reverseGeocode(
  geocodingLib: google.maps.GeocodingLibrary,
  location: Location,
): Promise<string> {
  const geocoder = new geocodingLib.Geocoder();
  const response = await geocoder.geocode({ location });

  if (response.results.length === 0) {
    throw new Error("No address found for the given location.");
  }

  return response.results[0].formatted_address ?? "Unknown location";
}

export function useReverseGeocode(
  lat: number | undefined,
  lng: number | undefined,
  enabled = true,
) {
  const geocodingLib = useMapsLibrary("geocoding");

  return useQuery({
    queryKey: ["reverse-geocode", lat, lng],
    queryFn: () => reverseGeocode(geocodingLib!, { lat: lat!, lng: lng! }),
    enabled: enabled && lat != null && lng != null,
    staleTime: Infinity,
  });
}
