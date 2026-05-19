import { getAllSlots } from "../services/parking.service";
import { queryKeys } from "@/config/query-keys";
import useCustomQuery from "@/common/hooks/useCustomQuery";

function useParkingSlots() {
  const { data: locations, isLoading } = useCustomQuery({
    key: queryKeys.parking.available(),
    queryFn: getAllSlots,
  });
  return { locations, isLoading };
}

export default useParkingSlots;
