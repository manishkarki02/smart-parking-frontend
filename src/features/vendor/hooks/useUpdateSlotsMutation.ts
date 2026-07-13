import useCustomMutation from "@/common/hooks/useCustomMutation";
import { useQueryClient } from "@tanstack/react-query";
import { updateAvailableSlots } from "../services/vendor.service";
import { queryKeys } from "@/config/query-keys";

function useUpdateSlotsMutation({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useCustomMutation({
    api: ({
      parkingId,
      newSlots,
    }: {
      parkingId: number | string;
      newSlots: number;
    }) => updateAvailableSlots(parkingId, newSlots),
    success: "Slots updated successfully!",
    error: "Failed to update slots",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      onOpenChange(false);
    },
  });
  return { mutateAsync, isPending };
}

export default useUpdateSlotsMutation;
