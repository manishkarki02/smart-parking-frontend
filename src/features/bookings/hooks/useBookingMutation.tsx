import useCustomMutation from "@/common/hooks/useCustomMutation";
import { createBooking } from "../services/booking.service";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";

function useBookingMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useCustomMutation({
    api: createBooking,
    success: "Booking created successfully!",
    error: "Failed to create booking",
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.me(),
      });
      navigate({ to: "/bookings" as string });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (typeof message === "string") {
        toast.error(message);
      }
    },
  });

  return { mutateAsync, isPending };
}

export default useBookingMutation;
