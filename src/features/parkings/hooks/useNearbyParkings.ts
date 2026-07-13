import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getNearbyParking } from "../services/parking.service";

function useNearbyParkings({
  lat,
  lng,
  radius = 5,
}: {
  lat: number | null;
  lng: number | null;
  radius?: number;
}) {
  const hasCoordinates =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng);

  const { data = [], isLoading } = useCustomQuery({
    key: queryKeys.parking.nearby(lat ?? 0, lng ?? 0, radius),
    queryFn: () => getNearbyParking(lat ?? 0, lng ?? 0, radius),
    options: {
      enabled: hasCoordinates,
    },
  });
  return { data, locations: data, isLoading };
}

export default useNearbyParkings;
