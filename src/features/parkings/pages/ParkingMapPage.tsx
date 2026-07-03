import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/common/components/PageHeader";
import { MapProvider } from "@/common/components/maps/MapProvider";
import { useGeolocation } from "@/common/hooks/maps/useGeolocation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/config/query-keys";
import {
  DriverParkingListCard,
  DriverParkingMap,
  MapLegend,
  ParkingEmptyState,
  ParkingErrorState,
  ParkingListSkeleton,
} from "@/features/parkings/components/map/ParkingMapContent";
import { getAllSlots } from "@/features/parkings/services/parking.service";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import {
  calculateDistanceKm,
  getUserLocation,
} from "@/features/parkings/utils/parking-map.utils";
import { cn } from "@/lib/utils";

export function ParkingMapPage() {
  const navigate = useNavigate();
  const { state: geoState, locate } = useGeolocation();
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(
    null,
  );
  const [listOpen, setListOpen] = useState(true);

  const {
    data: locations = [],
    isLoading,
    isError,
    refetch,
  } = useCustomQuery({
    key: queryKeys.parking.available(),
    queryFn: getAllSlots,
    options: {
      enabled: true,
    },
  });

  const userLocation = getUserLocation(geoState);
  const enrichedLocations = useMemo(
    () =>
      locations.map((location) => ({
        ...location,
        displayDistance:
          location.distance ??
          (userLocation
            ? calculateDistanceKm(userLocation, {
                lat: location.latitude,
                lng: location.longitude,
              })
            : undefined),
      })),
    [locations, userLocation],
  );

  const selectedLocation =
    enrichedLocations.find((location) => location.id === selectedParkingId) ??
    null;

  function viewParking(location: ParkingLocation) {
    navigate({
      to: "/parkings/$id",
      params: { id: location.id },
    });
  }

  return (
    <>
      <PageHeader
        title="Find Parking"
        content={
          <div className="min-w-0 py-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
              Find Parking
            </h1>
            <p className="truncate text-sm text-slate-500">
              View available parking locations near you
            </p>
          </div>
        }
      />

      <div
        className={cn(
          "relative grid min-h-[calc(100vh-4rem)] min-w-0 grid-cols-1 overflow-hidden transition-[grid-template-columns] duration-300 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]",
          !listOpen && "lg:grid-cols-[0px_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "min-w-0 overflow-hidden border-b border-slate-200 bg-white transition-opacity duration-200 lg:border-b-0 lg:border-r",
            !listOpen && "pointer-events-none opacity-0 lg:border-r-0",
          )}
          aria-hidden={!listOpen}
        >
          <div className="flex h-full max-h-[46vh] min-h-[360px] min-w-0 flex-col lg:max-h-none">
            <div className="border-b border-slate-200 px-4 py-4">
              <MapLegend userLocation={Boolean(userLocation)} />
              {geoState.status === "error" ? (
                <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {geoState.message}
                </p>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {isLoading ? (
                <ParkingListSkeleton />
              ) : isError ? (
                <ParkingErrorState onRetry={() => void refetch()} />
              ) : enrichedLocations.length === 0 ? (
                <ParkingEmptyState />
              ) : (
                enrichedLocations.map((location) => (
                  <DriverParkingListCard
                    key={location.id}
                    location={location}
                    selected={location.id === selectedLocation?.id}
                    onSelect={() => setSelectedParkingId(location.id)}
                    onView={() => viewParking(location)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "absolute left-3 top-3 z-20 size-8 rounded-full bg-white shadow-sm lg:left-[calc(min(400px,100%-1rem)-1rem)]",
            !listOpen && "lg:left-3",
          )}
          onClick={() => setListOpen((open) => !open)}
          aria-label={listOpen ? "Collapse parking list" : "Expand parking list"}
        >
          {listOpen ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>

        <section className="relative min-h-[420px] min-w-0 overflow-hidden bg-slate-100 lg:min-h-0">
          <MapProvider>
            <DriverParkingMap
              locations={enrichedLocations}
              selectedLocation={selectedLocation}
              userLocation={userLocation}
              isLoading={isLoading}
              onSelect={setSelectedParkingId}
              onView={viewParking}
              onLocate={locate}
              locating={geoState.status === "locating"}
            />
          </MapProvider>
        </section>
      </div>
    </>
  );
}
