import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addParkingSchema,
  type AddParkingFormValues,
} from "../validation/vendor.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { LocationPickerMap, type PickerLocation } from "./LocationPickerMap";
import { ENV } from "@/config/env-constant";
import useAddParkingMutation from "../hooks/useAddParkingMutation";
import { LocationPickerMap2 } from "./LocationPickerMap2";

interface AddParkingFormProps {
  onSuccess?: () => void;
}

export function AddParkingForm({ onSuccess }: AddParkingFormProps) {
  const [pickedLocation, setPickedLocation] = useState<PickerLocation | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddParkingFormValues>({
    resolver: zodResolver(addParkingSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
      totalSlots: undefined,
    },
  });

  const { mutateAsync, isPending } = useAddParkingMutation(() => {
    reset();
    setPickedLocation(null);
    onSuccess?.();
  });

  const handleMapPick = (coords: PickerLocation) => {
    setPickedLocation(coords);
    setValue("latitude", coords.lat, { shouldValidate: true });
    setValue("longitude", coords.lng, { shouldValidate: true });
    if (coords.address) {
      setValue("address", coords.address, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AddParkingFormValues) => {
    await mutateAsync(addParkingSchema.parse(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <LocationPickerMap2
          apiKey={ENV.VITE_GOOGLE_MAPS_API_KEY}
          value={pickedLocation}
          onChange={handleMapPick}
        />
        <LocationPickerMap value={pickedLocation} onChange={handleMapPick} />
        {/* Show error if lat/lng/address not picked */}
        {(errors.latitude || errors.longitude || errors.address) &&
          !pickedLocation && (
            <p className="text-sm text-destructive">
              Please click on the map to automatically set the location and
              address.
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Parking Location
      </Button>
    </form>
  );
}
