import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingSchema,
  type BookingFormValues,
} from "../validation/booking.schema";
import { getAllSlots } from "@/features/parking/services/parking.service";
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

interface BookingFormProps {
  preselectedParkingId?: number;
}

export function BookingForm({ preselectedParkingId }: BookingFormProps) {
  const { data: parkingSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: queryKeys.parking.availableSlots(),
    queryFn: getAllSlots,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bookingSchema as any),
    defaultValues: {
      parkingLocationId: preselectedParkingId ?? 0,
      startTime: "",
      endTime: "",
    },
  });

  const bookingMutation = useBookingMutation();

  const onSubmit = (data: BookingFormValues) => {
    bookingMutation.mutateAsync({
      parkingLocationId: data.parkingLocationId,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    });
  };

  return (
    <Card className="max-w-lg mx-auto w-full bg-card/60 backdrop-blur-sm border shadow-xl sm:rounded-2xl">
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
      <CardContent>
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
                  preselectedParkingId
                    ? String(preselectedParkingId)
                    : undefined
                }
                onValueChange={(val) =>
                  setValue("parkingLocationId", Number(val), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parking location" />
                </SelectTrigger>
                <SelectContent>
                  {parkingSlots.map((slot) => (
                    <SelectItem key={slot.id} value={String(slot.id)}>
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
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register("startTime")}
            />
            {errors.startTime && (
              <p className="text-sm text-destructive">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register("endTime")}
            />
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
