import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Bike, Car, CreditCard, Loader2, ParkingCircle, ReceiptText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/common/components/form/FieldError";
import { RequiredLabel } from "@/common/components/form/RequiredLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/config/query-keys";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import {
  getAllSlots,
  getParkingSlots,
} from "@/features/parkings/services/parking.service";
import type { ParkingSlotVehicleType } from "@/features/parkings/types/parking.types";
import { initiatePayment } from "@/features/payments/services/payment.service";
import {
  bookingSchema,
  type BookingFormValues,
} from "../validations/booking.schema";
import useBookingMutation from "../hooks/useBookingMutation";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  preselectedParkingId?: string;
  onSuccess?: () => void;
  navigateOnSuccess?: boolean;
  variant?: "page" | "dialog";
}

function toDateTimeInputValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toBackendLocalDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function getDefaultTimes() {
  const now = new Date();
  return {
    startTime: toDateTimeInputValue(now),
    endTime: toDateTimeInputValue(new Date(now.getTime() + 60 * 60_000)),
  };
}

function getDurationHours(startTime: string, endTime: string) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return (end - start) / 3_600_000;
}

function getVehicleLabel(vehicleType: ParkingSlotVehicleType) {
  return vehicleType === "TWO_WHEELER" ? "Two Wheeler" : "Four Wheeler";
}

function getVehicleRate(
  vehicleType: ParkingSlotVehicleType,
  twoWheelerRate?: number,
  fourWheelerRate?: number,
) {
  return vehicleType === "TWO_WHEELER"
    ? Number(twoWheelerRate ?? 0)
    : Number(fourWheelerRate ?? 0);
}

export function BookingForm({
  preselectedParkingId,
  onSuccess,
  navigateOnSuccess = true,
  variant = "page",
}: BookingFormProps) {
  const defaultTimes = useMemo(() => getDefaultTimes(), []);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      parkingLocationId: preselectedParkingId ?? "",
      slotId: "",
      vehicleType: "TWO_WHEELER",
      vehicleNumber: "",
      startTime: defaultTimes.startTime,
      endTime: defaultTimes.endTime,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const nextTimes = getDefaultTimes();
    reset({
      parkingLocationId: preselectedParkingId ?? "",
      slotId: "",
      vehicleType: "TWO_WHEELER",
      vehicleNumber: "",
      startTime: nextTimes.startTime,
      endTime: nextTimes.endTime,
    });
  }, [preselectedParkingId, reset]);

  const parkingLocationId = useWatch<BookingFormValues, "parkingLocationId">({
    control,
    name: "parkingLocationId",
  });
  const vehicleType = useWatch<BookingFormValues, "vehicleType">({
    control,
    name: "vehicleType",
  });
  const slotId = useWatch<BookingFormValues, "slotId">({
    control,
    name: "slotId",
  });
  const vehicleNumber = useWatch<BookingFormValues, "vehicleNumber">({
    control,
    name: "vehicleNumber",
  });
  const startTime = useWatch<BookingFormValues, "startTime">({
    control,
    name: "startTime",
  });
  const endTime = useWatch<BookingFormValues, "endTime">({
    control,
    name: "endTime",
  });

  const { data: parkingLocations = [], isLoading: locationsLoading } = useQuery({
    queryKey: queryKeys.parking.available(),
    queryFn: getAllSlots,
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: queryKeys.parking.slots(parkingLocationId || "none", vehicleType),
    queryFn: () => getParkingSlots(parkingLocationId, vehicleType),
    enabled: Boolean(parkingLocationId),
  });

  const selectedLocation = parkingLocations.find(
    (location) => location.id === parkingLocationId,
  );
  const availableSlots = slots.filter(
    (slot) => slot.status === "AVAILABLE" && slot.vehicleType === vehicleType,
  );
  const selectedSlot = availableSlots.find((slot) => slot.id === slotId);
  const hourlyRate = getVehicleRate(
    vehicleType,
    selectedLocation?.twoWheelerRatePerHour,
    selectedLocation?.fourWheelerRatePerHour,
  );
  const durationHours = getDurationHours(startTime, endTime);
  const estimatedAmount = durationHours * hourlyRate;
  const currentMinTime = useMemo(() => toDateTimeInputValue(new Date()), []);
  const canCreateBooking = Boolean(
    parkingLocationId &&
      vehicleType &&
      slotId &&
      vehicleNumber.trim() &&
      startTime &&
      endTime &&
      durationHours > 0,
  );

  useEffect(() => {
    if (!slotId) return;
    if (!selectedSlot) {
      setValue("slotId", "", { shouldValidate: true });
    }
  }, [selectedSlot, setValue, slotId]);

  useEffect(() => {
    if (!startTime || !endTime) return;
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      setValue(
        "endTime",
        toDateTimeInputValue(new Date(start + 60 * 60_000)),
        { shouldValidate: true },
      );
    }
  }, [endTime, setValue, startTime]);

  const bookingMutation = useBookingMutation({
    onSuccess,
    navigateOnSuccess,
  });

  const onSubmit = async (data: BookingFormValues) => {
    try {
      const booking = await bookingMutation.mutateAsync({
        parkingLocationId: data.parkingLocationId,
        slotId: data.slotId,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber.trim(),
        startTime: toBackendLocalDateTime(data.startTime),
        endTime: toBackendLocalDateTime(data.endTime),
      });

      const payment = await initiatePayment({
        bookingId: booking.bookingId,
        paymentMethod: "KHALTI",
      });

      if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank", "noopener,noreferrer");
        return;
      }

      toast.info("Payment initiated. Transaction ID: " + payment.transactionId);
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
        return;
      }
      if (message) {
        toast.error(message);
      }
    }
  };

  const isSubmitDisabled = bookingMutation.isPending || !canCreateBooking;

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <SelectField
          label="Parking Location"
          error={errors.parkingLocationId?.message}
        >
          <Select
            value={parkingLocationId}
            onValueChange={(value) => {
              setValue("parkingLocationId", value, { shouldValidate: true });
              setValue("slotId", "", { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-10 w-full border-slate-200 shadow-none focus:ring-2 focus:ring-blue-500">
              <SelectValue
                placeholder={
                  locationsLoading ? "Loading locations..." : "Select a parking location"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {parkingLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>

        <SelectField label="Vehicle Type" error={errors.vehicleType?.message}>
          <div className="grid overflow-hidden rounded-md border border-slate-200 sm:grid-cols-2">
            {(["TWO_WHEELER", "FOUR_WHEELER"] as const).map((option) => {
              const Icon = option === "TWO_WHEELER" ? Bike : Car;
              const isSelected = vehicleType === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 text-sm font-medium transition",
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50",
                  )}
                  onClick={() => {
                    setValue("vehicleType", option, { shouldValidate: true });
                    setValue("slotId", "", { shouldValidate: true });
                  }}
                >
                  <Icon className="size-4" />
                  {getVehicleLabel(option)}
                </button>
              );
            })}
          </div>
        </SelectField>

        <SelectField label="Slot" error={errors.slotId?.message}>
          <Select
            value={slotId}
            onValueChange={(value) =>
              setValue("slotId", value, { shouldValidate: true })
            }
            disabled={!parkingLocationId || slotsLoading || availableSlots.length === 0}
          >
            <SelectTrigger className="h-10 w-full border-slate-200 shadow-none focus:ring-2 focus:ring-blue-500">
              <ParkingCircle className="size-4 text-slate-500" />
              <SelectValue
                placeholder={
                  !parkingLocationId
                    ? "Select a parking location first"
                    : slotsLoading
                      ? "Loading slots..."
                      : availableSlots.length === 0
                        ? "No available slots for this vehicle type"
                        : "Select an available slot"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.length === 0 ? (
                <SelectItem value="none" disabled>
                  No available slots for this vehicle type
                </SelectItem>
              ) : (
                availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.slotNumber}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </SelectField>

        <TextField label="Vehicle Number" error={errors.vehicleNumber?.message}>
          <Input
            value={vehicleNumber}
            placeholder="e.g. BA 2 PA 1234"
            autoComplete="off"
            className="h-10 border-slate-200 shadow-none focus-visible:ring-blue-500"
            onChange={(event) => {
              setValue("vehicleNumber", event.target.value, {
                shouldValidate: true,
              });
            }}
          />
        </TextField>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Start Time" error={errors.startTime?.message}>
            <Input
              type="datetime-local"
              min={currentMinTime}
              className="h-10 border-slate-200 shadow-none focus-visible:ring-blue-500"
              {...register("startTime")}
            />
          </TextField>
          <TextField label="End Time" error={errors.endTime?.message}>
            <Input
              type="datetime-local"
              min={startTime || currentMinTime}
              className="h-10 border-slate-200 shadow-none focus-visible:ring-blue-500"
              {...register("endTime")}
            />
          </TextField>
        </div>

        <div className="rounded-md border border-blue-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <ReceiptText className="size-4 text-blue-600" />
                Estimated Amount
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Payment will be completed through Khalti after booking creation.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Rs. {hourlyRate.toFixed(0)}/hr x {formatDuration(durationHours)}
              </p>
            </div>
            <p className="shrink-0 text-2xl font-bold text-blue-700">
              Rs. {estimatedAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:grid-cols-[1fr_1.8fr]">
        <Button
          type="button"
          variant="outline"
          className="h-11 bg-white shadow-none"
          onClick={onSuccess}
          disabled={bookingMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-11 bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitDisabled}
        >
          {bookingMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CreditCard className="size-4" />
          )}
          Create Booking
        </Button>
      </div>
    </form>
  );

  if (variant === "dialog") {
    return form;
  }

  return (
    <Card className="mx-auto w-full max-w-lg overflow-hidden rounded-lg border bg-white shadow-sm">
      <CardHeader className="border-b bg-slate-50 text-center">
        <CardTitle>Book Your Parking</CardTitle>
        <CardDescription>Select a location and choose your parking time</CardDescription>
      </CardHeader>
      <CardContent className="p-0">{form}</CardContent>
    </Card>
  );
}

function SelectField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <RequiredLabel className="text-sm font-semibold text-slate-950">
        {label}
      </RequiredLabel>
      {children}
      <FieldError message={error} className="text-xs text-red-600" />
    </div>
  );
}

function TextField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <RequiredLabel className="text-sm font-semibold text-slate-950">
        {label}
      </RequiredLabel>
      {children}
      <FieldError message={error} className="text-xs text-red-600" />
    </div>
  );
}

function formatDuration(durationHours: number) {
  if (!Number.isFinite(durationHours) || durationHours <= 0) return "0 hr";
  const hours = Math.floor(durationHours);
  const minutes = Math.round((durationHours - hours) * 60);
  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
  if (hours > 0) return `${hours} hr`;
  return `${minutes} min`;
}
