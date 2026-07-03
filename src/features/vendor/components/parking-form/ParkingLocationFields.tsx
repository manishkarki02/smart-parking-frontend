import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { LocationPickerMap } from "@/common/components/maps/LocationPickerMap";
import { useLeafletLocationSearch } from "@/common/hooks/maps/useLeafletGeocode";
import { useReverseGeocode } from "@/common/hooks/maps/useReverseGeocode";
import useDebounce from "@/common/hooks/useDebounce";
import type { PickerLocation } from "@/common/types/map.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParkingLocationFieldsProps {
  pickedLocation: PickerLocation | null;
  onLocationChange: (location: PickerLocation) => void;
  onLocationReset: () => void;
  hasLocationError: boolean;
}

type LocationMethod = "search" | "coordinates" | "map" | null;

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

export function ParkingLocationFields({
  pickedLocation,
  onLocationChange,
  onLocationReset,
  hasLocationError,
}: ParkingLocationFieldsProps) {
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

  const handleCoordinateChange = (field: "lat" | "lng", value: string) => {
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
