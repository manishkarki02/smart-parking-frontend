import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import { getThamelNearbyParking } from "../services/parking.service";

function useThamelNearbyParking({
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
    key: queryKeys.parking.thamelNearby(lat ?? 0, lng ?? 0, radius),
    queryFn: () => getThamelNearbyParking(lat ?? 0, lng ?? 0, radius),
    options: {
      enabled: hasCoordinates,
    },
  });
  return { locations: data, isLoading };
}

export default useThamelNearbyParking;
