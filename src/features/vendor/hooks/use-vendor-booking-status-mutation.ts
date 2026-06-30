import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/query-keys";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { updateVendorBookingStatus } from "../services/vendor.service";

export function useVendorBookingStatusMutation(parkingLocationId: string) {
  const queryClient = useQueryClient();

  return useCustomMutation({
    api: updateVendorBookingStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.detail(parkingLocationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(parkingLocationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.vendor() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookings() });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
      } else {
        toast.error(message || "Booking status update failed");
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(parkingLocationId),
      });
    },
  });
}
