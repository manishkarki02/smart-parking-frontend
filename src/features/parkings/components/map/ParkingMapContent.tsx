import { useEffect } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Map,
  MapControl,
  ControlPosition,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  Bike,
  Car,
  CircleParking,
  Crosshair,
  Loader2,
  Minus,
  MapPin,
  Navigation,
  Plus,
  RefreshCcw,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import type { LatLng } from "@/features/parkings/utils/parking-map.utils";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

type AvailabilityState = "available" | "almostFull" | "full";

export type EnrichedParkingLocation = ParkingLocation & {
  displayDistance?: number;
};

const availabilityStyles: Record<
  AvailabilityState,
  {
    label: string;
    badge: string;
    marker: string;
    markerRing: string;
  }
> = {
  available: {
    label: "Available",
    badge: "border-green-200 bg-green-50 text-green-700",
    marker: "bg-green-600 text-white",
    markerRing: "ring-green-200",
  },
  almostFull: {
    label: "Almost Full",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    marker: "bg-amber-600 text-white",
    markerRing: "ring-amber-200",
  },
  full: {
    label: "Full",
    badge: "border-red-200 bg-red-50 text-red-700",
    marker: "bg-slate-500 text-white",
    markerRing: "ring-slate-200",
  },
};

interface DriverParkingMapProps {
  locations: EnrichedParkingLocation[];
  selectedLocation: EnrichedParkingLocation | null;
  userLocation: LatLng | null;
  isLoading: boolean;
  onSelect: (id: string | null) => void;
  onView: (location: ParkingLocation) => void;
  onLocate: () => void;
  locating: boolean;
}

export function DriverParkingMap({
  locations,
  selectedLocation,
  userLocation,
  isLoading,
  onSelect,
  onView,
  onLocate,
  locating,
}: DriverParkingMapProps) {
  return (
    <div className="h-full min-h-[420px] w-full overflow-hidden lg:min-h-full">
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={14}
        mapId="driver-find-parking"
        disableDefaultUI
        gestureHandling="greedy"
      >
        <MapViewportSync
          selectedLocation={selectedLocation}
          userLocation={userLocation}
          locations={locations}
        />

        {userLocation ? <UserLocationMarker location={userLocation} /> : null}

        {locations.map((location) => (
          <AdvancedMarker
            key={location.id}
            position={{ lat: location.latitude, lng: location.longitude }}
            onClick={() => onSelect(location.id)}
          >
            <ParkingMapMarker
              location={location}
              selected={location.id === selectedLocation?.id}
            />
          </AdvancedMarker>
        ))}

        {selectedLocation ? (
          <InfoWindow
            position={{
              lat: selectedLocation.latitude,
              lng: selectedLocation.longitude,
            }}
            pixelOffset={[0, -44]}
            onCloseClick={() => onSelect(null)}
          >
            <ParkingMapPopup
              location={selectedLocation}
              onView={() => onView(selectedLocation)}
            />
          </InfoWindow>
        ) : null}

        <MapControl position={ControlPosition.RIGHT_TOP}>
          <MapControlButtons onLocate={onLocate} locating={locating} />
        </MapControl>
      </Map>

      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <Loader2 className="size-4 animate-spin text-blue-600" />
            Loading parking locations...
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MapControlButtons({
  onLocate,
  locating,
}: {
  onLocate: () => void;
  locating: boolean;
}) {
  const map = useMap();

  function zoomBy(delta: number) {
    if (!map) return;
    map.setZoom((map.getZoom() ?? 14) + delta);
  }

  return (
    <div className="m-3 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex size-9 items-center justify-center border-b border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={() => zoomBy(1)}
        title="Zoom in"
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        className="flex size-9 items-center justify-center border-b border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={() => zoomBy(-1)}
        title="Zoom out"
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        className="flex size-9 items-center justify-center text-blue-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={onLocate}
        disabled={locating}
        title="Use current location"
      >
        {locating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Crosshair className="size-4" />
        )}
      </button>
    </div>
  );
}

function MapViewportSync({
  selectedLocation,
  userLocation,
  locations,
}: {
  selectedLocation: EnrichedParkingLocation | null;
  userLocation: LatLng | null;
  locations: EnrichedParkingLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedLocation) {
      map.panTo({
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude,
      });
      map.setZoom(Math.max(map.getZoom() ?? 14, 15));
      return;
    }

    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
      return;
    }

    if (locations.length > 0) {
      map.panTo({
        lat: locations[0].latitude,
        lng: locations[0].longitude,
      });
    }
  }, [locations, map, selectedLocation, userLocation]);

  return null;
}

export function DriverParkingListCard({
  location,
  selected,
  onSelect,
  onView,
}: {
  location: EnrichedParkingLocation;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
}) {
  const availability = getAvailability(location);
  const isFull = availability === "full";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "w-full rounded-lg border bg-white p-4 text-left transition hover:border-blue-200 hover:shadow-sm",
        selected && "border-blue-500 bg-blue-50/70 shadow-sm",
        isFull && "bg-slate-50 text-slate-500",
      )}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {location.name}
          </p>
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{location.address}</span>
          </p>
        </div>
        <AvailabilityBadge state={availability} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Bike className="size-3.5" />
          {formatSlotCount(location.availableTwoWheelerSlots)} avail.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Car className="size-3.5" />
          {formatSlotCount(location.availableFourWheelerSlots)} avail.
        </span>
        {location.displayDistance != null ? (
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Navigation className="size-3.5" />
            {formatDistance(location.displayDistance)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-slate-600">
          {formatRates(location)}
        </p>
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-3"
          variant={isFull ? "outline" : "default"}
          onClick={(event) => {
            event.stopPropagation();
            onView();
          }}
        >
          View
        </Button>
      </div>
    </div>
  );
}

function ParkingMapMarker({
  location,
  selected,
}: {
  location: EnrichedParkingLocation;
  selected: boolean;
}) {
  const availability = getAvailability(location);
  const styles = availabilityStyles[availability];

  return (
    <div
      className={cn(
        "flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg ring-4",
        styles.marker,
        styles.markerRing,
        selected && "scale-110 bg-blue-600 ring-blue-200",
      )}
    >
      <CircleParking className="size-5" />
    </div>
  );
}

function UserLocationMarker({ location }: { location: LatLng }) {
  return (
    <AdvancedMarker position={location}>
      <div className="relative flex flex-col items-center">
        <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg ring-4 ring-blue-200">
          <UserRound className="size-5" />
        </div>
        <span className="-mt-1 size-3 rotate-45 border-b-2 border-r-2 border-white bg-blue-600 shadow-md" />
      </div>
    </AdvancedMarker>
  );
}

function ParkingMapPopup({
  location,
  onView,
}: {
  location: EnrichedParkingLocation;
  onView: () => void;
}) {
  const availability = getAvailability(location);

  return (
    <div className="w-64 max-w-[72vw] p-1 font-sans">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 truncate text-sm font-semibold text-slate-950">
          {location.name}
        </h2>
        <AvailabilityBadge state={availability} />
      </div>

      <div className="mt-3 space-y-2 text-xs text-slate-600">
        <p className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{location.address}</span>
        </p>
        {location.displayDistance != null ? (
          <p className="flex items-center gap-1.5">
            <Navigation className="size-3.5" />
            {formatDistance(location.displayDistance)} away
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-y border-slate-200 py-3 text-center">
        <SlotMetric label="Total avail." value={location.availableSlots} />
        <SlotMetric label="2W slots" value={location.availableTwoWheelerSlots} />
        <SlotMetric label="4W slots" value={location.availableFourWheelerSlots} />
      </div>

      <p className="mt-3 truncate text-xs text-slate-600">
        {formatRates(location)}
      </p>
      <Button type="button" className="mt-3 h-8 w-full gap-1.5" onClick={onView}>
        <CircleParking className="size-4" />
        View Parking
      </Button>
    </div>
  );
}

function SlotMetric({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-blue-600">{value ?? "--"}</p>
      <p className="mt-1 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function AvailabilityBadge({ state }: { state: AvailabilityState }) {
  const styles = availabilityStyles[state];

  return (
    <Badge className={cn("shrink-0 rounded-full", styles.badge)}>
      <span className="size-1.5 rounded-full bg-current" />
      {styles.label}
    </Badge>
  );
}

export function MapLegend({ userLocation }: { userLocation: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-700">
      <span className="font-semibold text-slate-500">Legend:</span>
      <LegendDot className="bg-green-600" label="Available" />
      <LegendDot className="bg-amber-600" label="Almost Full" />
      <LegendDot className="bg-slate-500" label="Full" />
      {userLocation ? <LegendDot className="bg-blue-600" label="Your location" /> : null}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={cn("size-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

export function ParkingListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function ParkingEmptyState() {
  return (
    <Card className="border-dashed border-slate-200 bg-white shadow-none">
      <CardContent className="p-6 text-center">
        <CircleParking className="mx-auto size-9 text-slate-400" />
        <h2 className="mt-3 text-sm font-semibold text-slate-950">
          No parking locations available
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          There are no parking locations to show right now.
        </p>
      </CardContent>
    </Card>
  );
}

export function ParkingErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-red-100 bg-white shadow-none">
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Unable to load parking locations
        </h2>
        <p className="mt-1 text-sm text-slate-500">Please try again.</p>
        <Button type="button" className="mt-4 gap-2" size="sm" onClick={onRetry}>
          <RefreshCcw className="size-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function getAvailability(location: ParkingLocation): AvailabilityState {
  if (location.availableSlots === 0) return "full";
  const totalSlots = location.totalSlots ?? 0;
  const occupancy =
    totalSlots > 0
      ? Math.round(((totalSlots - location.availableSlots) / totalSlots) * 100)
      : 0;
  return occupancy >= 80 ? "almostFull" : "available";
}

function formatSlotCount(value?: number) {
  return value ?? "--";
}

function formatDistance(distance: number) {
  return `${distance.toFixed(distance < 10 ? 1 : 0)} km`;
}

function formatRates(location: ParkingLocation) {
  const twoWheelerRate =
    location.twoWheelerRatePerHour != null
      ? `Rs. ${location.twoWheelerRatePerHour}/hr 2W`
      : null;
  const fourWheelerRate =
    location.fourWheelerRatePerHour != null
      ? `Rs. ${location.fourWheelerRatePerHour}/hr 4W`
      : null;
  return (
    [twoWheelerRate, fourWheelerRate].filter(Boolean).join(" · ") ||
    "Rates unavailable"
  );
}
