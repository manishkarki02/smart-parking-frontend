import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingSchema,
  type BookingFormValues,
} from "../validations/booking.schema";
import { getAllSlots } from "@/features/parkings/services/parking.service";
import { getParkingSlots } from "@/features/parkings/services/parking.service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Car } from "lucide-react";
import useBookingMutation from "../hooks/useBookingMutation";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  preselectedParkingId?: string;
  onSuccess?: () => void;
  navigateOnSuccess?: boolean;
  variant?: "page" | "dialog";
}

export function BookingForm({
  preselectedParkingId,
  onSuccess,
  navigateOnSuccess = true,
  variant = "page",
}: BookingFormProps) {
  const { data: parkingSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: queryKeys.parking.available(),
    queryFn: getAllSlots,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      parkingLocationId: preselectedParkingId ?? "",
      slotId: "",
      vehicleType: "TWO_WHEELER",
      vehicleNumber: "",
      startTime: "",
      endTime: "",
    },
  });

  const selectedParkingId = watch("parkingLocationId");
  const selectedVehicleType = watch("vehicleType");

  const { data: availableSlots = [], isLoading: slotsForLocationLoading } =
    useQuery({
      queryKey: queryKeys.parking.slots(
        selectedParkingId || "none",
        selectedVehicleType,
      ),
      queryFn: () => getParkingSlots(selectedParkingId, selectedVehicleType),
      enabled: Boolean(selectedParkingId),
      select: (slots) => slots.filter((slot) => slot.status === "AVAILABLE"),
    });

  const bookingMutation = useBookingMutation({
    onSuccess,
    navigateOnSuccess,
  });

  const onSubmit = (data: BookingFormValues) => {
    const today = new Date().toISOString().split("T")[0];

    void bookingMutation.mutateAsync({
      parkingLocationId: data.parkingLocationId,
      slotId: data.slotId,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber.trim(),
      startTime: new Date(`${today}T${data.startTime}:00`).toISOString(),
      endTime: new Date(`${today}T${data.endTime}:00`).toISOString(),
    });
  };

  return (
    <Card
      className={cn(
        "max-w-lg mx-auto w-full bg-card/60 backdrop-blur-sm border shadow-xl sm:rounded-2xl",
        variant === "dialog" &&
          "mx-0 max-w-none border-0 bg-transparent py-0 shadow-none backdrop-blur-none",
      )}
    >
      {variant === "page" ? (
        <CardHeader className="text-center pb-8 border-b bg-muted/20 mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary shadow-inner">
              <Car className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Book Your Parking
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Select a location and choose your parking time
          </CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className={cn(variant === "dialog" && "px-0")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Parking Location</Label>
            {slotsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading locations...
              </p>
            ) : (
              <Select
                defaultValue={
                  preselectedParkingId ? preselectedParkingId : undefined
                }
                onValueChange={(val) => {
                  setValue("parkingLocationId", val, {
                    shouldValidate: true,
                  });
                  setValue("slotId", "", { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parking location" />
                </SelectTrigger>
                <SelectContent>
                  {parkingSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.name} ({slot.availableSlots} slots available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.parkingLocationId && (
              <p className="text-sm text-destructive">
                {errors.parkingLocationId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select
              defaultValue="TWO_WHEELER"
              onValueChange={(val) => {
                if (val === "TWO_WHEELER" || val === "FOUR_WHEELER") {
                  setValue("vehicleType", val, { shouldValidate: true });
                  setValue("slotId", "", { shouldValidate: true });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TWO_WHEELER">Two Wheeler</SelectItem>
                <SelectItem value="FOUR_WHEELER">Four Wheeler</SelectItem>
              </SelectContent>
            </Select>
            {errors.vehicleType && (
              <p className="text-sm text-destructive">
                {errors.vehicleType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Slot</Label>
            {slotsForLocationLoading ? (
              <p className="text-sm text-muted-foreground">Loading slots...</p>
            ) : (
              <Select
                value={watch("slotId") || undefined}
                onValueChange={(val) =>
                  setValue("slotId", val, { shouldValidate: true })
                }
                disabled={!selectedParkingId || availableSlots.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an available slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.slotNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.slotId && (
              <p className="text-sm text-destructive">{errors.slotId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
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

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" {...register("startTime")} />
            {errors.startTime && (
              <p className="text-sm text-destructive">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" {...register("endTime")} />
            {errors.endTime && (
              <p className="text-sm text-destructive">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={bookingMutation.isPending}
          >
            {bookingMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Booking
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
