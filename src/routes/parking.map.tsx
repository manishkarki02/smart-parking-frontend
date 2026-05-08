import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DriverLayout } from "@/common/components/DriverLayout";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useParkingSlots from "@/features/parking/hooks/useParkingSlots";
import { MapProvider } from "@/features/parking/maps/components/MapProvider";
import { ParkingOverviewMap } from "@/features/parking/maps/components/ParkingOverviewMap";
import { DirectionsMap } from "@/features/parking/maps/components/DirectionsMap";
import type { ParkingLocation } from "@/features/parking/types/parking.types";
import { useGeolocation } from "@/features/parking/maps/hooks/useGeoLocation";

export const Route = createFileRoute("/parking/map")({
  component: ParkingMapPage,
});

function ParkingMapPage() {
  const { locations, isLoading } = useParkingSlots();
  const { state: geoState, locate } = useGeolocation();
  const navigate = useNavigate();

  const [directionsTarget, setDirectionsTarget] =
    useState<ParkingLocation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userCoords =
    geoState.status === "located"
      ? { lat: geoState.lat, lng: geoState.lng }
      : null;

  const handleGetDirections = (spot: ParkingLocation) => {
    locate();
    setDirectionsTarget(spot);
  };

  return (
    <DriverLayout>
      {/*
        This wrapper fills exactly the remaining viewport below the sticky 64px header.
        `overflow-hidden` prevents any scroll bleed.
      */}
      <div className="relative w-full overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

        {/* ── Full-bleed map ── */}
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground bg-muted/20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading parking locations…</p>
            </div>
          ) : (
            /*
              Override the shared lp-wrapper / lp-map-area fixed heights so
              ParkingOverviewMap and DirectionsMap stretch to fill the parent.
            */
            <div
              className="h-full w-full"
              style={{
                ["--lp-map-height" as string]: "100%",
              }}
            >
              <style>{`
                .lp-map-fullscreen .lp-wrapper {
                  height: 100%;
                  border-radius: 0;
                  gap: 0;
                }
                .lp-map-fullscreen .lp-map-area {
                  height: 100%;
                  flex: 1;
                  border-radius: 0;
                  border: none;
                }
                .lp-map-fullscreen .lp-footer {
                  position: absolute;
                  bottom: 8px;
                  left: 12px;
                  background: rgba(255,255,255,0.85);
                  backdrop-filter: blur(6px);
                  padding: 4px 10px;
                  border-radius: 999px;
                  font-size: 0.75rem;
                  box-shadow: 0 1px 6px rgba(0,0,0,0.12);
                  z-index: 5;
                }
              `}</style>
              <div className="lp-map-fullscreen h-full">
                <MapProvider>
                  {!directionsTarget ? (
                    <ParkingOverviewMap
                      spots={locations ?? []}
                      onGetDirections={handleGetDirections}
                    />
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 min-h-0">
                        {userCoords ? (
                          <DirectionsMap
                            origin={userCoords}
                            destination={{
                              lat: directionsTarget.latitude,
                              lng: directionsTarget.longitude,
                            }}
                            destinationName={directionsTarget.name}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm">Waiting for your location…</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </MapProvider>
              </div>
            </div>
          )}
        </div>

        {/* ── Floating top-left controls ── */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {/* Back button */}
          <Link to="/">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 shadow-md backdrop-blur-sm bg-background/90 border"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>

          {/* Page title pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-background/90 border text-sm font-semibold">
            <MapPin className="w-4 h-4 text-primary" />
            {directionsTarget ? (
              <span>Directions to <span className="text-primary">{directionsTarget.name}</span></span>
            ) : (
              <span>Parking Map</span>
            )}
          </div>

          {/* Clear directions */}
          {directionsTarget && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 shadow-md backdrop-blur-sm bg-background/90 border"
              onClick={() => setDirectionsTarget(null)}
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        {/* ── Floating stats pill (top-right) ── */}
        {!isLoading && locations && !directionsTarget && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-background/90 border text-xs font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {locations.filter((l) => l.availableSlots > 3).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              {locations.filter((l) => l.availableSlots > 0 && l.availableSlots <= 3).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              {locations.filter((l) => l.availableSlots === 0).length}
            </span>
          </div>
        )}

        {/* ── Floating directions info bar ── */}
        {directionsTarget && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-background/90 border text-xs font-medium">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Getting directions…</span>
          </div>
        )}

        {/* ── Collapsible floating sidebar ── */}
        {!isLoading && !directionsTarget && (
          <>
            {/* Toggle tab */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="absolute bottom-1/2 translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 rounded-r-lg bg-background/95 border border-l-0 shadow-md transition-all"
              style={{ left: sidebarOpen ? "320px" : "0px" }}
              title={sidebarOpen ? "Hide list" : "Show list"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Sidebar panel */}
            <div
              className="absolute top-0 left-0 bottom-0 z-10 flex flex-col bg-background/95 backdrop-blur-md border-r shadow-xl transition-transform duration-300"
              style={{
                width: "320px",
                transform: sidebarOpen ? "translateX(0)" : "translateX(-320px)",
              }}
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <p className="text-sm font-bold">
                  {locations?.length ?? 0} Parking Spots
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" /> Low
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Full
                  </span>
                </div>
              </div>

              {/* Spot list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {locations?.map((spot) => {
                  const isFull = spot.availableSlots === 0;
                  const isLow = spot.availableSlots <= 3 && !isFull;
                  const dotColor = isFull
                    ? "bg-red-500"
                    : isLow
                      ? "bg-orange-500"
                      : "bg-green-500";
                  const badgeColor = isFull
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : isLow
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                  const statusText = isFull ? "Full" : isLow ? "Low" : "Available";

                  return (
                    <div
                      key={spot.id}
                      className="rounded-xl border p-3 cursor-pointer hover:border-primary/50 hover:shadow-sm bg-card transition-all group"
                      onClick={() => handleGetDirections(spot)}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-semibold text-sm truncate leading-tight">
                              {spot.name}
                            </p>
                            <span className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full ${badgeColor}`}>
                              {statusText}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {spot.address}
                          </p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className="text-xs text-muted-foreground">
                              {isFull ? (
                                <span className="text-red-500 font-medium">No slots</span>
                              ) : (
                                <>
                                  <span className="text-foreground font-bold">{spot.availableSlots}</span> slots left
                                </>
                              )}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate({
                                    to: "/parking/$id",
                                    params: { id: spot.id.toString() },
                                  });
                                }}
                              >
                                Details
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="text-xs h-6 px-2 gap-1"
                                disabled={isFull}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGetDirections(spot);
                                }}
                              >
                                <Navigation className="w-3 h-3" />
                                Go
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DriverLayout>
  );
}
