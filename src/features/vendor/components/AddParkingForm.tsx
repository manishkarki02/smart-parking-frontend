import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LocateFixed, MapPin, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { MapProvider } from "@/common/components/maps/MapProvider";
import { LocationPickerMap } from "@/common/components/maps/LocationPickerMap";
import { useLeafletLocationSearch } from "@/common/hooks/maps/useLeafletGeocode";
import { useReverseGeocode } from "@/common/hooks/maps/useReverseGeocode";
import useDebounce from "@/common/hooks/useDebounce";
import type { PickerLocation } from "@/common/types/map.types";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface LocationFieldsProps {
  pickedLocation: PickerLocation | null;
  onLocationChange: (location: PickerLocation) => void;
  onLocationReset: () => void;
  hasLocationError: boolean;
}

type LocationMethod = "search" | "coordinates" | "map" | null;
type ParkingFormInputName =
  | "name"
  | "totalFourWheelerSlots"
  | "totalTwoWheelerSlots"
  | "fourWheelerRatePerHour"
  | "twoWheelerRatePerHour";

function isValidCoordinatePair(latValue: string, lngValue: string) {
  const lat = Number(latValue);
  const lng = Number(lngValue);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function LocationFields({
  pickedLocation,
  onLocationChange,
  onLocationReset,
  hasLocationError,
}: LocationFieldsProps) {
  const [activeMethod, setActiveMethod] = useState<LocationMethod>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [reverseCoords, setReverseCoords] = useState<PickerLocation | null>(
    null,
  );
  const geocodeErrorShownRef = useRef(false);
  const reverseErrorShownRef = useRef(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const debouncedLat = useDebounce(manualLat, 400);
  const debouncedLng = useDebounce(manualLng, 400);

  const canUseSearch = activeMethod == null || activeMethod === "search";
  const canUseCoordinates =
    activeMethod == null || activeMethod === "coordinates";
  const canUseMap = activeMethod == null || activeMethod === "map";

  const {
    data: searchResults = [],
    isFetching: isSearching,
    isError: isSearchError,
  } = useLeafletLocationSearch(
    activeMethod === "search" ? debouncedSearchQuery : "",
  );

  const {
    data: resolvedAddress,
    isFetching: isResolvingAddress,
    isError: isReverseError,
  } = useReverseGeocode(reverseCoords?.lat, reverseCoords?.lng, !!reverseCoords);

  useEffect(() => {
    if (!pickedLocation || activeMethod != null) return;

    queueMicrotask(() => {
      setSearchQuery(pickedLocation.address ?? "");
      setManualLat(String(pickedLocation.lat));
      setManualLng(String(pickedLocation.lng));
    });
  }, [activeMethod, pickedLocation]);

  useEffect(() => {
    if (
      activeMethod !== "coordinates" ||
      !isValidCoordinatePair(debouncedLat, debouncedLng)
    ) {
      return;
    }

    const nextLocation = {
      lat: Number(debouncedLat),
      lng: Number(debouncedLng),
    };

    queueMicrotask(() => {
      setReverseCoords(nextLocation);
      onLocationChange(nextLocation);
    });
  }, [activeMethod, debouncedLat, debouncedLng, onLocationChange]);

  useEffect(() => {
    if (!resolvedAddress || !reverseCoords) return;

    const nextLocation = {
      ...reverseCoords,
      address: resolvedAddress,
    };

    queueMicrotask(() => {
      setSearchQuery(resolvedAddress);
      onLocationChange(nextLocation);
    });
  }, [resolvedAddress, reverseCoords, onLocationChange]);

  useEffect(() => {
    if (!isSearchError || geocodeErrorShownRef.current) return;

    geocodeErrorShownRef.current = true;
    toast.error("Unable to search for that address. Please try again.");
  }, [isSearchError]);

  useEffect(() => {
    if (!isReverseError || reverseErrorShownRef.current) return;

    reverseErrorShownRef.current = true;
    toast.error("Unable to resolve an address for those coordinates.");
  }, [isReverseError]);

  const handleSearchChange = (value: string) => {
    geocodeErrorShownRef.current = false;
    setActiveMethod("search");
    setSearchQuery(value);
    setShowSearchResults(true);
  };

  const handleSearchSelect = (location: PickerLocation) => {
    setSearchQuery(location.address ?? "");
    setShowSearchResults(false);
    setManualLat(String(location.lat));
    setManualLng(String(location.lng));
    onLocationChange(location);
  };

  const handleCoordinateChange = (
    field: "lat" | "lng",
    value: string,
  ) => {
    reverseErrorShownRef.current = false;
    setActiveMethod("coordinates");

    if (field === "lat") {
      setManualLat(value);
    } else {
      setManualLng(value);
    }
  };

  const handleMapPick = (coords: PickerLocation) => {
    reverseErrorShownRef.current = false;
    setActiveMethod("map");
    setManualLat(String(coords.lat));
    setManualLng(String(coords.lng));
    if (coords.address) {
      setSearchQuery(coords.address);
    }
    onLocationChange(coords);
  };

  const handleReset = () => {
    setActiveMethod(null);
    setShowMap(false);
    setSearchQuery("");
    setShowSearchResults(false);
    setManualLat("");
    setManualLng("");
    setReverseCoords(null);
    geocodeErrorShownRef.current = false;
    reverseErrorShownRef.current = false;
    onLocationReset();
  };

  const hasActiveLocation = activeMethod != null || pickedLocation != null;
  const lockedMessage =
    activeMethod === "search"
      ? "Address search is active. Reset to use coordinates or map."
      : activeMethod === "coordinates"
        ? "Manual coordinates are active. Reset to use search or map."
        : activeMethod === "map"
          ? "Map picker is active. Reset to use search or coordinates."
          : "Choose one location method.";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Area / Address
        </Label>
        {hasActiveLocation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-2 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Change location
          </Button>
        )}
      </div>

      <div className={canUseSearch ? "space-y-2" : "space-y-2 opacity-55"}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            placeholder="Search area or address"
            className="h-12 rounded-lg pl-11 text-base"
            autoComplete="off"
            disabled={!canUseSearch}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>

        {canUseSearch &&
          activeMethod === "search" &&
          showSearchResults &&
          searchQuery.trim() && (
            <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
              {isSearching ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Searching locations...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.placeId}
                      type="button"
                      className="flex w-full items-start gap-2 border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted"
                      onClick={() =>
                        handleSearchSelect({
                          lat: result.lat,
                          lng: result.lng,
                          address: result.label,
                        })
                      }
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span>{result.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No matching locations found.
                </div>
              )}
            </div>
          )}
      </div>

      <div
        className={
          canUseCoordinates
            ? "grid gap-3 sm:grid-cols-2"
            : "grid gap-3 opacity-55 sm:grid-cols-2"
        }
      >
        <div className="space-y-2">
          <Label
            htmlFor="latitude"
            className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Latitude
          </Label>
          <Input
            id="latitude"
            inputMode="decimal"
            placeholder="27.717245"
            value={manualLat}
            disabled={!canUseCoordinates}
            onChange={(event) =>
              handleCoordinateChange("lat", event.target.value)
            }
            className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="longitude"
            className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Longitude
          </Label>
          <Input
            id="longitude"
            inputMode="decimal"
            placeholder="85.324004"
            value={manualLng}
            disabled={!canUseCoordinates}
            onChange={(event) =>
              handleCoordinateChange("lng", event.target.value)
            }
            className="h-12 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            {isResolvingAddress
              ? "Fetching address from coordinates..."
              : pickedLocation?.address ||
                "Search an address, enter coordinates, or choose from the map."}
          </div>
          {activeMethod && (
            <div className="text-xs font-medium text-muted-foreground">
              {lockedMessage}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={!canUseMap}
          onClick={() => {
            setActiveMethod("map");
            setShowMap((value) => !value);
          }}
        >
          <LocateFixed className="mr-2 size-4" />
          {showMap ? "Hide map" : "Select from map"}
        </Button>
      </div>

      {showMap && (
        <div className="add-location-map rounded-xl border bg-muted/20 p-3">
          <LocationPickerMap value={pickedLocation} onChange={handleMapPick} />
        </div>
      )}

      {hasLocationError && !pickedLocation && (
        <p className="text-sm text-destructive">
          Search and select an address, enter valid coordinates, or pick a
          location from the map.
        </p>
      )}
    </div>
  );
}

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
    resetField,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddParkingFormValues>({
    resolver: zodResolver(addParkingSchema),
    defaultValues: getParkingFormDefaults(initialValues),
    mode: "onChange",
    reValidateMode: "onChange",
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
    const value = watch(field);
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

  const handleLocationReset = useCallback(() => {
    setPickedLocation(null);
    resetField("address");
    resetField("latitude");
    resetField("longitude");
  }, [resetField]);

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
          <LocationFields
            pickedLocation={pickedLocation}
            onLocationChange={handleLocationChange}
            onLocationReset={handleLocationReset}
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
