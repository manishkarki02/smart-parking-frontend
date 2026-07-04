import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { MapProvider } from "@/common/components/maps/MapProvider";
import type { PickerLocation } from "@/common/types/map.types";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingLocationFields } from "@/features/vendor/components/parking-form/ParkingLocationFields";
import {
  addParkingSchema,
  type AddParkingFormValues,
} from "../validations/vendor.schema";
import useAddParkingMutation from "../hooks/useAddParkingMutation";
import useUpdateParkingMutation from "../hooks/useUpdateParkingMutation";

interface ParkingLocationFormProps {
  mode?: "create" | "edit";
  initialValues?: ParkingLocation;
  onCancel?: () => void;
  onSuccess?: () => void;
}

type ParkingFormInputName =
  | "name"
  | "totalFourWheelerSlots"
  | "totalTwoWheelerSlots"
  | "fourWheelerRatePerHour"
  | "twoWheelerRatePerHour";

function getParkingFormDefaults(
  location?: ParkingLocation,
): AddParkingFormValues {
  return {
    name: location?.name ?? "",
    address: location?.address ?? "",
    latitude: location?.latitude ?? "",
    longitude: location?.longitude ?? "",
    totalFourWheelerSlots: location?.totalFourWheelerSlots ?? "",
    totalTwoWheelerSlots: location?.totalTwoWheelerSlots ?? "",
    fourWheelerRatePerHour: location?.fourWheelerRatePerHour ?? "",
    twoWheelerRatePerHour: location?.twoWheelerRatePerHour ?? "",
  };
}

function getPickedLocation(location?: ParkingLocation): PickerLocation | null {
  if (location?.latitude == null || location?.longitude == null) return null;

  return {
    lat: location.latitude,
    lng: location.longitude,
    address: location.address,
  };
}

export function ParkingLocationForm({
  mode = "create",
  initialValues,
  onCancel,
  onSuccess,
}: ParkingLocationFormProps) {
  const [pickedLocation, setPickedLocation] = useState<PickerLocation | null>(
    getPickedLocation(initialValues),
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddParkingFormValues>({
    resolver: zodResolver(addParkingSchema),
    defaultValues: getParkingFormDefaults(initialValues),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const watchedName = useWatch({ control, name: "name" });
  const watchedFourWheelerSlots = useWatch({
    control,
    name: "totalFourWheelerSlots",
  });
  const watchedTwoWheelerSlots = useWatch({
    control,
    name: "totalTwoWheelerSlots",
  });
  const watchedFourWheelerRate = useWatch({
    control,
    name: "fourWheelerRatePerHour",
  });
  const watchedTwoWheelerRate = useWatch({
    control,
    name: "twoWheelerRatePerHour",
  });

  useEffect(() => {
    queueMicrotask(() => {
      reset(getParkingFormDefaults(initialValues));
      setPickedLocation(getPickedLocation(initialValues));
    });
  }, [initialValues, reset]);

  const addMutation = useAddParkingMutation(() => {
    reset();
    setPickedLocation(null);
    onSuccess?.();
  });

  const updateMutation = useUpdateParkingMutation(() => {
    onSuccess?.();
  });

  const isPending = addMutation.isPending || updateMutation.isPending;

  const getInputValue = (field: ParkingFormInputName) => {
    const value = {
      name: watchedName,
      totalFourWheelerSlots: watchedFourWheelerSlots,
      totalTwoWheelerSlots: watchedTwoWheelerSlots,
      fourWheelerRatePerHour: watchedFourWheelerRate,
      twoWheelerRatePerHour: watchedTwoWheelerRate,
    }[field];

    return typeof value === "string" || typeof value === "number" ? value : "";
  };

  const bindFormInput = (field: ParkingFormInputName) => {
    const registered = register(field);

    return {
      ...registered,
      value: getInputValue(field),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        registered.onChange(event);
        setValue(field, event.target.value, { shouldValidate: true });
      },
    };
  };

  const handleLocationChange = useCallback((coords: PickerLocation) => {
    setPickedLocation(coords);
    setValue("latitude", coords.lat, { shouldValidate: true });
    setValue("longitude", coords.lng, { shouldValidate: true });

    if (coords.address) {
      setValue("address", coords.address, { shouldValidate: true });
    }
  }, [setValue]);

  const onSubmit = async (data: AddParkingFormValues) => {
    const parsed = addParkingSchema.parse(data);

    if (mode === "edit" && initialValues?.id) {
      await updateMutation.mutateAsync({
        parkingId: initialValues.id,
        data: parsed,
      });
      return;
    }

    await addMutation.mutateAsync(parsed);
  };

  const hasLocationError = errors.latitude || errors.longitude || errors.address;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6 px-6 py-6 sm:px-8">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Location Name
          </Label>
          <Input
            id="name"
            placeholder="e.g. Thamel Parking Hub"
            className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
            {...bindFormInput("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <MapProvider>
          <ParkingLocationFields
            pickedLocation={pickedLocation}
            onLocationChange={handleLocationChange}
            hasLocationError={Boolean(hasLocationError)}
          />
        </MapProvider>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="totalFourWheelerSlots"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              4W Slots
            </Label>
            <Input
              id="totalFourWheelerSlots"
              type="number"
              min={0}
              placeholder="20"
              className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
              {...bindFormInput("totalFourWheelerSlots")}
            />
            {errors.totalFourWheelerSlots && (
              <p className="text-sm text-destructive">
                {errors.totalFourWheelerSlots.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="totalTwoWheelerSlots"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              2W Slots
            </Label>
            <Input
              id="totalTwoWheelerSlots"
              type="number"
              min={0}
              placeholder="30"
              className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
              {...bindFormInput("totalTwoWheelerSlots")}
            />
            {errors.totalTwoWheelerSlots && (
              <p className="text-sm text-destructive">
                {errors.totalTwoWheelerSlots.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="fourWheelerRatePerHour"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              4W Rate (Rs/hr)
            </Label>
            <Input
              id="fourWheelerRatePerHour"
              type="number"
              min={1}
              placeholder="80"
              className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
              {...bindFormInput("fourWheelerRatePerHour")}
            />
            {errors.fourWheelerRatePerHour && (
              <p className="text-sm text-destructive">
                {errors.fourWheelerRatePerHour.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="twoWheelerRatePerHour"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              2W Rate (Rs/hr)
            </Label>
            <Input
              id="twoWheelerRatePerHour"
              type="number"
              min={1}
              placeholder="40"
              className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
              {...bindFormInput("twoWheelerRatePerHour")}
            />
            {errors.twoWheelerRatePerHour && (
              <p className="text-sm text-destructive">
                {errors.twoWheelerRatePerHour.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4 sm:px-8">
        <Button
          type="button"
          variant="outline"
          className="h-11 min-w-28 rounded-lg"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-11 min-w-28 rounded-lg"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export const AddParkingForm = ParkingLocationForm;
