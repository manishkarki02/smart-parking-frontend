import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getThamelNearbyParking } from "../services/parking.service";

function useThamelNearbyParking({
  lat,
  lng,
  radius = 5,
}: {
  lat: number;
  lng: number;
  radius?: number;
}) {
  const { data = [], isLoading } = useCustomQuery({
    key: queryKeys.parking.thamelNearby(lat ?? 0, lng ?? 0, radius),
    queryFn: () => getThamelNearbyParking(lat ?? 0, lng ?? 0, radius),
    options: {
      enabled: lat !== null && lng !== null,
    },
  });
  return { locations: data, isLoading };
}

export default useThamelNearbyParking;
