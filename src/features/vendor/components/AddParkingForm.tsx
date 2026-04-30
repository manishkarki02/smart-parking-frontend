import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addParkingSchema,
  type AddParkingFormValues,
} from "../validation/vendor.schema";
import { addParkingLocation } from "../services/vendor.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { useState } from "react";
import { LocationPickerMap, type PickerLocation } from "./LocationPickerMap";

interface AddParkingFormProps {
  onSuccess?: () => void;
}

export function AddParkingForm({ onSuccess }: AddParkingFormProps) {
  const queryClient = useQueryClient();

  const [pickedLocation, setPickedLocation] = useState<PickerLocation | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddParkingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addParkingSchema as any),
    defaultValues: {
      name: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
      totalSlots: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: addParkingLocation,
    onSuccess: () => {
      toast.success("Parking location added successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.myLocations });
      reset();
      setPickedLocation(null);
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to add parking location"
          : "Failed to add parking location";
      toast.error(message);
    },
  });

  const handleMapPick = (coords: PickerLocation) => {
    setPickedLocation(coords);
    setValue("latitude", coords.lat, { shouldValidate: true });
    setValue("longitude", coords.lng, { shouldValidate: true });
    if (coords.address) {
      setValue("address", coords.address, { shouldValidate: true });
    }
  };

  const onSubmit = (data: AddParkingFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Location Name</Label>
        <Input
          id="name"
          placeholder="e.g. Thamel Parking Zone A"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Map Location Picker */}
      <div className="space-y-2">
        <Label>Pick Location on Map</Label>
        <LocationPickerMap value={pickedLocation} onChange={handleMapPick} />
        {/* Show error if lat/lng/address not picked */}
        {(errors.latitude || errors.longitude || errors.address) && !pickedLocation && (
          <p className="text-sm text-destructive">
            Please click on the map to automatically set the location and address.
          </p>
        )}
      </div>

      {/* Total Slots */}
      <div className="space-y-2">
        <Label htmlFor="totalSlots">Total Slots</Label>
        <Input
          id="totalSlots"
          type="number"
          placeholder="20"
          {...register("totalSlots")}
        />
        {errors.totalSlots && (
          <p className="text-sm text-destructive">
            {errors.totalSlots.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Add Parking Location
      </Button>
    </form>
  );
}
