import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getNearbyGPSParking } from "../services/parking.service";

function useNearbyGPS({
  lat,
  lng,
  radius = 5,
}: {
  lat: number;
  lng: number;
  radius?: number;
}) {
  const { data = [], isLoading } = useCustomQuery({
    key: queryKeys.parking.nearbyGps(lat ?? 0, lng ?? 0, radius),
    queryFn: () => getNearbyGPSParking(lat ?? 0, lng ?? 0, radius),
    options: {
      enabled: lat !== null && lng !== null,
    },
  });
  return { locations: data, isLoading };
}

export default useNearbyGPS;
