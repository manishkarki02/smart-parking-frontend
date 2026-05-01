import { useState } from "react";
import { updateAvailableSlots } from "../services/vendor.service";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import useCustomMutation from "@/common/hooks/useCustomMutation";

interface UpdateSlotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkingId: number;
  parkingName: string;
  currentSlots: number;
}

export function UpdateSlotsDialog({
  open,
  onOpenChange,
  parkingId,
  parkingName,
  currentSlots,
}: UpdateSlotsDialogProps) {
  const [newSlots, setNewSlots] = useState(currentSlots);
  const queryClient = useQueryClient();

  const mutation = useCustomMutation({
    api: ({ parkingId, newSlots }: { parkingId: number; newSlots: number }) =>
      updateAvailableSlots(parkingId, newSlots),
    success: "Slots updated successfully!",
    error: "Failed to update slots",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.myLocations });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Available Slots</DialogTitle>
          <DialogDescription>
            Update the number of available slots for{" "}
            <span className="font-medium">{parkingName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="slots">Available Slots</Label>
          <Input
            id="slots"
            type="number"
            min={0}
            value={newSlots}
            onChange={(e) => setNewSlots(Number(e.target.value))}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutateAsync({ parkingId, newSlots })}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
