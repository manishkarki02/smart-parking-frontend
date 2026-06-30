import useCustomMutation from "@/common/hooks/useCustomMutation";
import { queryKeys } from "@/config/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { deleteParkingLocation } from "../services/vendor.service";

function useDeleteParkingMutation({
  onDeleted,
}: {
  onDeleted?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: (parkingId: number | string) => deleteParkingLocation(parkingId),
    success: "Parking location deleted successfully!",
    error: "Failed to delete parking location",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      onDeleted?.();
    },
  });
}

export default useDeleteParkingMutation;
