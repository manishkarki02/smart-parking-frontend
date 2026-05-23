import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { LatLng } from "../../types/map.types";

interface OsrmRouteResponse {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

async function fetchRoute(origin: LatLng, destination: LatLng) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const { data } = await axios.get<OsrmRouteResponse>(
    `https://router.project-osrm.org/route/v1/driving/${coords}`,
    {
      params: {
        overview: "full",
        geometries: "geojson",
      },
    },
  );

  const route = data.routes?.[0];
  if (!route) throw new Error("No route found");

  return {
    points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
    distance: route.distance,
    duration: route.duration,
  };
}

function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function useLeafletDirections(origin: LatLng | null, destination: LatLng | null) {
  const query = useQuery({
    queryKey: ["leaflet-directions", origin, destination],
    queryFn: () => fetchRoute(origin!, destination!),
    enabled: !!origin && !!destination,
    retry: 1,
  });

  return {
    points: query.data?.points ?? [],
    distance: query.data ? formatDistance(query.data.distance) : null,
    duration: query.data ? formatDuration(query.data.duration) : null,
    isLoading: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
