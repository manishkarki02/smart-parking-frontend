import { useState } from "react";
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
import useUpdateSlotsMutation from "../hooks/useUpdateSlotsMutation";

interface UpdateSlotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkingId: number | string;
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

  const { mutateAsync, isPending } = useUpdateSlotsMutation({
    onOpenChange,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Available Slots</DialogTitle>
          <DialogDescription>
            Update the number of available slots for
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
            onClick={() => mutateAsync({ parkingId, newSlots })}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
