import type { ComponentType, ReactNode } from "react";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import { AppLayout } from "@/common/components/AppLayout";
import { PageHeader } from "@/common/components/PageHeader";
import { PublicShell } from "@/common/components/PublicShell";
import { MapProvider } from "@/common/components/maps/MapProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SlotGrid } from "@/features/parkings/components/SlotGrid";
import type {
  ParkingLocation,
  ParkingSlot,
  ParkingSlotVehicleType,
} from "@/features/parkings/types/parking.types";
import {
  Bike,
  Building2,
  Car,
  CheckCircle2,
  CircleParking,
  Clock,
  CreditCard,
  MapIcon,
  MapPin,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ParkingDetailHeader({
  location,
  onFindParking,
  inlineFallback,
}: {
  location: ParkingLocation;
  onFindParking: () => void;
  inlineFallback: boolean;
}) {
  const content = (
    <div className="min-w-0 py-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <span>Find Parking</span>
        <span>/</span>
        <span>Parking Detail</span>
      </div>
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
          {location.name}
        </h1>
      </div>
    </div>
  );

  const action = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 gap-2 bg-white shadow-none"
      onClick={onFindParking}
    >
      <MapIcon className="size-4" />
      <span className="hidden sm:inline">Find Parking</span>
      <span className="sm:hidden">Find</span>
    </Button>
  );

  return (
    <>
      <PageHeader title={location.name} content={content} action={action} />
      {inlineFallback ? (
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
          {content}
          {action}
        </div>
      ) : null}
    </>
  );
}

export function ParkingLocationErrorState({
  onRetry,
  onFindParking,
}: {
  onRetry: () => void;
  onFindParking: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <MapPin className="size-5" />
      </div>
      <h1 className="text-xl font-semibold text-slate-950">
        Parking location not found
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        The location may have been removed or is temporarily unavailable.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
        <Button onClick={onFindParking}>Find Parking</Button>
      </div>
    </div>
  );
}

export function KpiGrid({
  location,
  slots,
}: {
  location: ParkingLocation;
  slots: ParkingSlot[];
}) {
  const totalSlots = location.totalSlots ?? slots.length;
  const availableSlots =
    location.availableSlots ??
    slots.filter((slot) => slot.status === "AVAILABLE").length;
  const twoWheelerTotal =
    location.totalTwoWheelerSlots ??
    slots.filter((slot) => slot.vehicleType === "TWO_WHEELER").length;
  const fourWheelerTotal =
    location.totalFourWheelerSlots ??
    slots.filter((slot) => slot.vehicleType === "FOUR_WHEELER").length;
  const twoWheelerAvailable =
    location.availableTwoWheelerSlots ??
    countAvailableSlots(slots, "TWO_WHEELER");
  const fourWheelerAvailable =
    location.availableFourWheelerSlots ??
    countAvailableSlots(slots, "FOUR_WHEELER");

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total Slots"
        value={formatNumber(totalSlots)}
        detail="Across all vehicle types"
        icon={CircleParking}
        iconClassName="bg-blue-50 text-blue-600"
      />
      <MetricCard
        label="Available Slots"
        value={formatNumber(availableSlots)}
        detail="Can be booked now"
        icon={CheckCircle2}
        iconClassName="bg-green-50 text-green-600"
      />
      <MetricCard
        label="Two Wheeler"
        value={formatNumber(twoWheelerAvailable)}
        detail={`of ${formatNumber(twoWheelerTotal)} slots available`}
        icon={Bike}
        iconClassName="bg-violet-50 text-violet-600"
      />
      <MetricCard
        label="Four Wheeler"
        value={formatNumber(fourWheelerAvailable)}
        detail={`of ${formatNumber(fourWheelerTotal)} slots available`}
        icon={Car}
        iconClassName="bg-sky-50 text-sky-600"
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex min-h-[118px] flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md",
              iconClassName,
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ParkingOverviewCard({
  location,
  slots,
}: {
  location: ParkingLocation;
  slots: ParkingSlot[];
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="space-y-5 p-4 md:p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            Parking Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Inspect location details and live slot availability before booking.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem icon={MapPin} label="Address" value={location.address} />
          <InfoItem
            icon={Building2}
            label="Vendor"
            value={location.vendorName}
          />
          <InfoItem
            icon={Navigation}
            label="Distance"
            value={
              location.distance
                ? `${location.distance.toFixed(1)} km away`
                : "Distance available from map search"
            }
          />
          <InfoItem
            icon={Clock}
            label="Current status"
            value={`${slots.filter((slot) => slot.status === "AVAILABLE").length} of ${
              location.totalSlots ?? slots.length
            } slots available`}
          />
          <InfoItem
            icon={CreditCard}
            label="Two-wheeler rate"
            value={`${formatRate(location.twoWheelerRatePerHour)} per hour`}
          />
          <InfoItem
            icon={CreditCard}
            label="Four-wheeler rate"
            value={`${formatRate(location.fourWheelerRatePerHour)} per hour`}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Select an available slot below to open the booking dialog. Unavailable
          slots remain visible so you can compare two-wheeler and four-wheeler
          sections before choosing.
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

export function MapPreviewCard({ location }: { location: ParkingLocation }) {
  const center = {
    lat: location.latitude,
    lng: location.longitude,
  };

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-none">
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Map Preview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick location preview and route context for arrival.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 bg-white shadow-none"
            onClick={() => void openDirectionsFromCurrentLocation(location)}
          >
            <Navigation className="size-4" />
            Navigate
          </Button>
        </div>

        <div className="h-[260px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <MapProvider>
            <Map
              mapId="driver-parking-detail"
              defaultCenter={center}
              defaultZoom={16}
              gestureHandling="greedy"
              disableDefaultUI
              className="h-full w-full"
            >
              <AdvancedMarker position={center}>
                <div className="flex flex-col items-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-blue-100">
                    <CircleParking className="size-5" />
                  </div>
                  <span className="mt-1 max-w-40 rounded bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow">
                    {location.name}
                  </span>
                </div>
              </AdvancedMarker>
            </Map>
          </MapProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function SlotSelectionCard({
  availableSlotsCount,
  isSlotsLoading,
  isSlotsError,
  isSlotsFetching,
  slots,
  selectedSlot,
  isSignedIn,
  onRetrySlots,
  onSelectSlot,
  onOpenBookings,
  onOpenLogin,
}: {
  availableSlotsCount: number;
  isSlotsLoading: boolean;
  isSlotsError: boolean;
  isSlotsFetching: boolean;
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  isSignedIn: boolean;
  onRetrySlots: () => void;
  onSelectSlot: (slot: ParkingSlot) => void;
  onOpenBookings: () => void;
  onOpenLogin: () => void;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-none">
      <CardContent className="space-y-5 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Select a Slot
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Only available slots can be selected. Reserved, booked, occupied,
              and maintenance slots stay visible for comparison.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            {availableSlotsCount} available now
          </Badge>
        </div>

        {isSlotsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : isSlotsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Slot availability failed to load.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-red-200 bg-white"
              onClick={onRetrySlots}
            >
              Retry slots
            </Button>
          </div>
        ) : slots.length > 0 ? (
          <SlotGrid
            slots={slots}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelectSlot={onSelectSlot}
          />
        ) : (
          <div className="rounded-lg border border-dashed bg-white p-8 text-center">
            <CircleParking className="mx-auto mb-3 size-8 text-slate-400" />
            <p className="font-semibold text-slate-950">No slots found</p>
            <p className="mt-1 text-sm text-slate-500">
              This parking location does not have slots configured yet.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
          <div className="text-slate-500">
            {selectedSlot ? (
              <span className="font-medium text-blue-700">
                Selected {selectedSlot.slotNumber}. Complete the booking in the
                modal.
              </span>
            ) : (
              <span>Click an available slot to start booking.</span>
            )}
            {isSlotsFetching && !isSlotsLoading ? (
              <span className="ml-2 text-xs text-slate-400">
                Refreshing statuses...
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={isSignedIn ? onOpenBookings : onOpenLogin}
          >
            {isSignedIn ? "My Bookings" : "Sign in to book"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ParkingDetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[118px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

export function ParkingDetailsLayout({
  children,
  isSignedIn,
}: {
  children: ReactNode;
  isSignedIn: boolean;
}) {
  if (isSignedIn) {
    return <AppLayout mainClassName="bg-slate-50">{children}</AppLayout>;
  }

  return <PublicShell>{children}</PublicShell>;
}

function countAvailableSlots(
  slots: ParkingSlot[],
  vehicleType: ParkingSlotVehicleType,
) {
  return slots.filter(
    (slot) => slot.vehicleType === vehicleType && slot.status === "AVAILABLE",
  ).length;
}

function formatNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "--";
}

function formatRate(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `Rs. ${value}`
    : "--";
}

function openDirectionsFromCurrentLocation(location: ParkingLocation) {
  const destination = `${location.latitude},${location.longitude}`;

  if (!navigator.geolocation) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const origin = `${position.coords.latitude},${position.coords.longitude}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    () => {
      toast.error("Unable to access your current location.");
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 60_000,
    },
  );
}
