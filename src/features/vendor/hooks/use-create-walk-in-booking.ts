import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/query-keys";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { createWalkInBooking } from "../services/vendor.service";

export function useCreateWalkInBooking(parkingLocationId: string) {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: createWalkInBooking,
    success: "Walk-in booking created successfully",
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.detail(parkingLocationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(parkingLocationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboardRoot() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.vendorRoot() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookingsRoot() });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
      } else {
        toast.error(message || "Walk-in booking failed");
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(parkingLocationId),
      });
    },
  });
}
