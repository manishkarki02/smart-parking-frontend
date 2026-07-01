import { getAllSlots } from "../services/parking.service";
import { queryKeys } from "@/config/query-keys";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { mockParkingLocations } from "../data/mock-parking-locations";

function useParkingSlots() {
  const { data: locations, isLoading, isError } = useCustomQuery({
    key: queryKeys.parking.available(),
    queryFn: getAllSlots,
  });

  const mergedLocations = import.meta.env.DEV ? [
    ...(locations ?? []),
    ...mockParkingLocations.filter(
      (mockLocation) =>
        !locations?.some((location) => location.id === mockLocation.id),
    ),
  ] : (locations ?? []);

  return {
    locations: mergedLocations,
    isLoading: isLoading && mergedLocations.length === 0 && !isError,
    isMockData: !locations?.length,
  };
}

export default useParkingSlots;
