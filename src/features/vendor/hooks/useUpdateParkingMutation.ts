import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { queryKeys } from "@/config/query-keys";
import type { ParkingLocationRequest } from "../types/vendor.types";
import { updateParkingLocation } from "../services/vendor.service";

function useUpdateParkingMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useCustomMutation({
    api: ({
      parkingId,
      data,
    }: {
      parkingId: number | string;
      data: ParkingLocationRequest;
    }) => updateParkingLocation(parkingId, data),
    success: "Parking location updated successfully!",
    error: "Failed to update parking location. Please try again.",
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      if (updatedLocation?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.parking.detail(updatedLocation.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.parking.vendorSlots(updatedLocation.id),
        });
      }
      onSuccess?.();
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (typeof message === "string") {
        toast.error(message);
      }
    },
  });

  return { isPending, mutateAsync };
}

export default useUpdateParkingMutation;
