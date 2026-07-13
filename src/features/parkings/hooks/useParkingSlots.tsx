import { getAllSlots } from "../services/parking.service";
import { queryKeys } from "@/config/query-keys";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { mockParkingLocations } from "../data/mock-parking-locations";
import { ENV } from "@/config/env-constants";

function useParkingSlots() {
  const { data: locations, isLoading, isError } = useCustomQuery({
    key: queryKeys.parking.available(),
    queryFn: getAllSlots,
  });

  const safeLocations = locations ?? [];
  const mergedLocations = ENV.VITE_ENABLE_MOCK_PARKINGS
    ? [
        ...safeLocations,
        ...mockParkingLocations.filter(
          (mockLocation) =>
            !safeLocations.some((location) => location.id === mockLocation.id),
        ),
      ]
    : safeLocations;

  return {
    locations: mergedLocations,
    isLoading: isLoading && mergedLocations.length === 0 && !isError,
    isMockData: ENV.VITE_ENABLE_MOCK_PARKINGS && !safeLocations.length,
  };
}

export default useParkingSlots;
