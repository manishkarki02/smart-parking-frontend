import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { createBooking } from "../services/booking.service";
import type { BookingRequest, BookingResponse } from "../types/booking.types";

export function useCreateDriverBooking(parkingLocationId: string) {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, BookingRequest>({
    mutationFn: createBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.me() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.detail(parkingLocationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.slotsForLocation(parkingLocationId),
      });
    },
    onError: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.slotsForLocation(parkingLocationId),
      });
    },
  });
}
