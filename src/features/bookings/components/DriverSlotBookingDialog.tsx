import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type {
  ParkingLocation,
  ParkingSlot,
  ParkingSlotVehicleType,
} from "@/features/parkings/types/parking.types";
import {
  driverBookingSchema,
  type DriverBookingFormValues,
} from "../schemas/driver-booking.schema";
import { useCreateDriverBooking } from "../hooks/use-create-driver-booking";

interface DriverSlotBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkingLocation: ParkingLocation;
  slot: ParkingSlot | null;
}

function toDateTimeLocalValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toBackendLocalDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function vehicleTypeLabel(vehicleType: ParkingSlotVehicleType) {
  return vehicleType === "TWO_WHEELER" ? "Two Wheeler" : "Four Wheeler";
}

function getRate(
  parkingLocation: ParkingLocation,
  vehicleType: ParkingSlotVehicleType,
) {
  return vehicleType === "TWO_WHEELER"
    ? parkingLocation.twoWheelerRatePerHour ?? 0
    : parkingLocation.fourWheelerRatePerHour ?? 0;
}

export function DriverSlotBookingDialog({
  open,
  onOpenChange,
  parkingLocation,
  slot,
}: DriverSlotBookingDialogProps) {
  const navigate = useNavigate();
  const createBooking = useCreateDriverBooking(parkingLocation.id);
  const now = useMemo(() => new Date(), [open, slot?.id]);
  const defaultStartTime = toDateTimeLocalValue(now);
  const defaultEndTime = toDateTimeLocalValue(
    new Date(now.getTime() + 60 * 60_000),
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DriverBookingFormValues>({
    resolver: zodResolver(driverBookingSchema),
    defaultValues: {
      vehicleNumber: "",
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;
    reset({
      vehicleNumber: "",
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    });
  }, [defaultEndTime, defaultStartTime, open, reset]);

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const rate = slot ? getRate(parkingLocation, slot.vehicleType) : 0;
  const estimatedAmount = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
    return (durationMs / 3_600_000) * rate;
  }, [endTime, rate, startTime]);

  const handlePayWithKhalti = async (bookingId: string) => {
    try {
      const payment = await initiatePayment({
        bookingId,
        paymentMethod: "KHALTI",
      });

      if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank");
        return;
      }

      toast.info("Payment initiated. Transaction ID: " + payment.transactionId);
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(typeof message === "string" ? message : "Payment initiation failed");
    }
  };

  const onSubmit = async (values: DriverBookingFormValues) => {
    if (!slot) return;

    try {
      const booking = await createBooking.mutateAsync({
        parkingLocationId: parkingLocation.id,
        slotId: slot.id,
        vehicleType: slot.vehicleType,
        vehicleNumber: values.vehicleNumber.trim(),
        startTime: toBackendLocalDateTime(values.startTime),
        endTime: toBackendLocalDateTime(values.endTime),
      });

      onOpenChange(false);
      toast.success("Booking created successfully", {
        description: `Backend total: Rs. ${Number(booking.totalAmount).toFixed(2)}`,
        action: {
          label: "Pay with Khalti",
          onClick: () => {
            void handlePayWithKhalti(booking.bookingId);
          },
        },
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
        return;
      }
      toast.error(message || "Booking creation failed");
    }
  };

  const isDisabled = createBooking.isPending || !slot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Confirm Slot Booking</DialogTitle>
          <DialogDescription>
            Select your parking time for this slot.
          </DialogDescription>
        </DialogHeader>

        {slot && (
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Parking
                </p>
                <p className="font-semibold">{parkingLocation.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Slot
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{slot.slotNumber}</span>
                  <Badge variant="secondary">{vehicleTypeLabel(slot.vehicleType)}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rate
                </p>
                <p className="font-semibold">Rs. {rate.toFixed(2)} / hour</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Estimated Amount
                </p>
                <p className="font-semibold text-primary">
                  Rs. {estimatedAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-vehicle-number">Vehicle number</Label>
              <Input
                id="driver-vehicle-number"
                placeholder="e.g. BA 2 PA 1234"
                autoComplete="off"
                {...register("vehicleNumber")}
              />
              {errors.vehicleNumber && (
                <p className="text-sm text-destructive">
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="driver-start-time">Start time</Label>
                <Input
                  id="driver-start-time"
                  type="datetime-local"
                  min={defaultStartTime}
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver-end-time">End time</Label>
                <Input
                  id="driver-end-time"
                  type="datetime-local"
                  min={startTime || defaultStartTime}
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isDisabled}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isDisabled}>
                {createBooking.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        )}

        {!slot && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an available slot before booking.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => navigate({ to: "/bookings" })}>
                View My Bookings
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
