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

interface AddParkingFormProps {
  onSuccess?: () => void;
}

export function AddParkingForm({ onSuccess }: AddParkingFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
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

  const onSubmit = (data: AddParkingFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="e.g. Thamel, Kathmandu"
          {...register("address")}
        />
        {errors.address && (
          <p className="text-sm text-destructive">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="27.7172"
            {...register("latitude")}
          />
          {errors.latitude && (
            <p className="text-sm text-destructive">
              {errors.latitude.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="85.3240"
            {...register("longitude")}
          />
          {errors.longitude && (
            <p className="text-sm text-destructive">
              {errors.longitude.message}
            </p>
          )}
        </div>
      </div>

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

      <Button
        type="submit"
        className="w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Add Parking Location
      </Button>
    </form>
  );
}
