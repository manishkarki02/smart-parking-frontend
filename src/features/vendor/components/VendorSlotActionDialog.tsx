import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  walkInBookingSchema,
  type WalkInBookingFormValues,
} from "@/features/bookings/schemas/walk-in-booking.schema";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import type {
  ParkingLocation,
  ParkingSlot,
  ParkingSlotVehicleType,
} from "@/features/parkings/types/parking.types";
import { useUpdateSlotStatusMutation } from "@/features/parkings/hooks/use-update-slot-status-mutation";
import { useCreateWalkInBooking } from "../hooks/use-create-walk-in-booking";
import { useVendorBookingStatusMutation } from "../hooks/use-vendor-booking-status-mutation";

interface VendorSlotActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: ParkingSlot | null;
  parkingLocation: ParkingLocation;
}

const statusLabels: Record<ParkingSlot["status"], string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

const vehicleLabels: Record<ParkingSlotVehicleType, string> = {
  TWO_WHEELER: "Two Wheeler",
  FOUR_WHEELER: "Four Wheeler",
};

function toDateTimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getDefaultEndTime(): string {
  const end = new Date();
  end.setHours(end.getHours() + 1);
  return toDateTimeLocalValue(end);
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

export function VendorSlotActionDialog({
  open,
  onOpenChange,
  slot,
  parkingLocation,
}: VendorSlotActionDialogProps) {
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const parkingLocationId = parkingLocation.id;
  const slotStatusMutation = useUpdateSlotStatusMutation(parkingLocationId);
  const walkInMutation = useCreateWalkInBooking(parkingLocationId);
  const bookingStatusMutation = useVendorBookingStatusMutation(parkingLocationId);

  const form = useForm<WalkInBookingFormValues>({
    resolver: zodResolver(walkInBookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      vehicleNumber: "",
      startTime: toDateTimeLocalValue(new Date()),
      endTime: getDefaultEndTime(),
      paymentMethod: "CASH",
    },
  });

  useEffect(() => {
    if (open) {
      setShowWalkInForm(false);
      form.reset({
        customerName: "",
        customerPhone: "",
        vehicleNumber: "",
        startTime: toDateTimeLocalValue(new Date()),
        endTime: getDefaultEndTime(),
        paymentMethod: "CASH",
      });
    }
  }, [form, open, slot?.id]);

  const activeBooking = slot?.activeBooking;
  const isPending =
    slotStatusMutation.isPending ||
    walkInMutation.isPending ||
    bookingStatusMutation.isPending;

  const hourlyRate = useMemo(() => {
    if (!slot) {
      return undefined;
    }

    return slot.vehicleType === "FOUR_WHEELER"
      ? parkingLocation.fourWheelerRatePerHour
      : parkingLocation.twoWheelerRatePerHour;
  }, [parkingLocation.fourWheelerRatePerHour, parkingLocation.twoWheelerRatePerHour, slot]);

  if (!slot) {
    return null;
  }

  const closeAfterSuccess = () => {
    setShowWalkInForm(false);
    onOpenChange(false);
  };

  const updateSlotStatus = async (status: "AVAILABLE" | "MAINTENANCE") => {
    await slotStatusMutation.mutateAsync({
      parkingLocationId,
      slotId: slot.id,
      status,
    });
    toast.success(
      status === "MAINTENANCE"
        ? "Slot marked as maintenance"
        : "Slot marked as available",
    );
    closeAfterSuccess();
  };

  const updateBookingStatus = async (action: VendorBookingAction) => {
    if (!activeBooking?.bookingId) {
      toast.error("Active booking not found for this slot.");
      return;
    }

    await bookingStatusMutation.mutateAsync({
      bookingId: activeBooking.bookingId,
      data: { action },
    });
    toast.success(action === "CHECK_IN" ? "Booking checked in" : "Booking completed");
    closeAfterSuccess();
  };

  const createWalkInBooking = async (values: WalkInBookingFormValues) => {
    await walkInMutation.mutateAsync({
      parkingLocationId,
      slotId: slot.id,
      vehicleType: slot.vehicleType,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      vehicleNumber: values.vehicleNumber,
      startTime: values.startTime,
      endTime: values.endTime,
      paymentMethod: values.paymentMethod,
    });
    closeAfterSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Slot {slot.slotNumber}
          </DialogTitle>
          <DialogDescription>
            {vehicleLabels[slot.vehicleType]} · Status: {statusLabels[slot.status]}
            {hourlyRate ? ` · Rs ${hourlyRate}/hr` : ""}
          </DialogDescription>
        </DialogHeader>

        {showWalkInForm ? (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(createWalkInBooking)}
          >
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-semibold">Create Walk-in Booking</p>
              <p className="text-muted-foreground">
                Slot: {slot.slotNumber} · Vehicle Type: {vehicleLabels[slot.vehicleType]}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldError label="Customer Name" error={form.formState.errors.customerName?.message}>
                <Input {...form.register("customerName")} disabled={isPending} />
              </FieldError>

              <FieldError label="Customer Phone" error={form.formState.errors.customerPhone?.message}>
                <Input {...form.register("customerPhone")} disabled={isPending} />
              </FieldError>
            </div>

            <FieldError label="Vehicle Number" error={form.formState.errors.vehicleNumber?.message}>
              <Input {...form.register("vehicleNumber")} disabled={isPending} />
            </FieldError>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldError label="Start Time" error={form.formState.errors.startTime?.message}>
                <Input
                  type="datetime-local"
                  {...form.register("startTime")}
                  disabled={isPending}
                />
              </FieldError>

              <FieldError label="Expected End Time" error={form.formState.errors.endTime?.message}>
                <Input
                  type="datetime-local"
                  {...form.register("endTime")}
                  disabled={isPending}
                />
              </FieldError>
            </div>

            <FieldError label="Payment Method" error={form.formState.errors.paymentMethod?.message}>
              <Select
                value={form.watch("paymentMethod")}
                onValueChange={(value) =>
                  form.setValue(
                    "paymentMethod",
                    value as WalkInBookingFormValues["paymentMethod"],
                    { shouldValidate: true },
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="KHALTI">Khalti</SelectItem>
                  <SelectItem value="ESEWA">Esewa</SelectItem>
                </SelectContent>
              </Select>
            </FieldError>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWalkInForm(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {walkInMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Create Booking
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-5">
            {(slot.status === "RESERVED" || slot.status === "OCCUPIED") && (
              <BookingSummary slot={slot} />
            )}

            {slot.status === "AVAILABLE" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={() => setShowWalkInForm(true)}
                  disabled={isPending}
                >
                  Create Walk-in Booking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateSlotStatus("MAINTENANCE")}
                  disabled={isPending}
                >
                  {slotStatusMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Mark as Maintenance
                </Button>
              </div>
            )}

            {slot.status === "RESERVED" && (
              <Button
                type="button"
                className="w-full"
                onClick={() => updateBookingStatus("CHECK_IN")}
                disabled={isPending || !activeBooking?.bookingId}
              >
                {bookingStatusMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Check In
              </Button>
            )}

            {slot.status === "OCCUPIED" && (
              <Button
                type="button"
                className="w-full"
                onClick={() => updateBookingStatus("COMPLETE")}
                disabled={isPending || !activeBooking?.bookingId}
              >
                {bookingStatusMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Complete Booking
              </Button>
            )}

            {slot.status === "MAINTENANCE" && (
              <Button
                type="button"
                className="w-full"
                onClick={() => updateSlotStatus("AVAILABLE")}
                disabled={isPending}
              >
                {slotStatusMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Mark as Available
              </Button>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldError({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function BookingSummary({ slot }: { slot: ParkingSlot }) {
  const booking = slot.activeBooking;

  if (!booking) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Active booking not found for this slot. Refresh the page or check the booking list.
      </div>
    );
  }

  const customer = booking.customerName ?? booking.driverName ?? "Not available";

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4 text-sm">
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Booking
        </p>
        <p className="font-mono text-xs">{booking.bookingId}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Customer / Driver" value={customer} />
        <SummaryItem label="Phone" value={booking.customerPhone ?? "Not available"} />
        <SummaryItem label="Vehicle Number" value={booking.vehicleNumber ?? "Not available"} />
        <SummaryItem label="Status" value={booking.status} />
        <SummaryItem label="Start Time" value={formatDateTime(booking.startTime)} />
        <SummaryItem label="End Time" value={formatDateTime(booking.endTime)} />
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}
