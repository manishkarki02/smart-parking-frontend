import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { addParkingLocation } from "../services/vendor.service";
import { queryKeys } from "@/config/query-keys";

function useAddParkingMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useCustomMutation({
    api: addParkingLocation,
    success: "Parking location added successfully!",
    error: "Failed to add parking location. Please try again.",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { isPending, mutateAsync };
}

export default useAddParkingMutation;
