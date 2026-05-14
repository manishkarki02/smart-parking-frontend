import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { Loader2, LocateFixed, Navigation } from "lucide-react";
import type { ParkingLocation } from "@/features/parking/types/parking.types";
import { useGeolocation } from "../hooks/useGeolocation";
import type { LatLng } from "../types/map.types";

const DEFAULT_CENTER: LatLng = { lat: 27.7172, lng: 85.324 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parkingIcon(spot: ParkingLocation) {
  const isFull = spot.availableSlots === 0;
  const isLow = spot.availableSlots <= 3 && !isFull;
  const color = isFull ? "#ef4444" : isLow ? "#f97316" : "#22c55e";

  return L.divIcon({
    className: "leaflet-parking-pin",
    html: `
      <div style="--pin-color:${color}">
        <strong>${isFull ? "FULL" : spot.availableSlots}</strong>
        <span>slots</span>
      </div>
    `,
    iconSize: [48, 42],
    iconAnchor: [24, 42],
    popupAnchor: [0, -36],
  });
}

const userIcon = L.divIcon({
  className: "leaflet-user-pin",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function MapViewport({
  spots,
  userLocation,
}: {
  spots: ParkingLocation[];
  userLocation: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points = spots.map((spot) => [spot.latitude, spot.longitude] as [number, number]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);

    if (points.length === 0) return;
    if (points.length === 1) {
      map.flyTo(points[0], 14);
      return;
    }

    map.fitBounds(points, { padding: [56, 56], maxZoom: 15 });
  }, [map, spots, userLocation]);

  return null;
}

interface LeafletParkingOverviewMapProps {
  spots: ParkingLocation[];
  onGetDirections: (spot: ParkingLocation) => void;
  defaultCenter?: LatLng;
  radiusKm?: number;
}

export function LeafletParkingOverviewMap({
  spots,
  onGetDirections,
  defaultCenter = DEFAULT_CENTER,
  radiusKm,
}: LeafletParkingOverviewMapProps) {
  const { state: geoState, locate } = useGeolocation();
  const hasAutoLocated = useRef(false);

  useEffect(() => {
    if (hasAutoLocated.current) return;
    hasAutoLocated.current = true;
    locate();
  }, [locate]);

  const userLocation = useMemo(
    () =>
      geoState.status === "located"
        ? { lat: geoState.lat, lng: geoState.lng }
        : null,
    [geoState],
  );

  const visibleSpots = useMemo(() => {
    const withDistance = spots.map((spot) => ({
      ...spot,
      distance: userLocation
        ? haversineKm(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude)
        : spot.distance,
    }));

    if (radiusKm == null || !userLocation) return withDistance;
    return withDistance.filter((spot) => (spot.distance ?? Infinity) <= radiusKm);
  }, [radiusKm, spots, userLocation]);

  return (
    <div className="lp-wrapper">
      {geoState.status === "locating" && (
        <div className="lp-search-row justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Finding your location...</span>
        </div>
      )}

      <div className="lp-map-area">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={13}
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <MapViewport spots={visibleSpots} userLocation={userLocation} />

          {userLocation && (
            <Marker icon={userIcon} position={[userLocation.lat, userLocation.lng]} />
          )}

          {visibleSpots.map((spot) => {
            const isFull = spot.availableSlots === 0;

            return (
              <Marker
                key={spot.id}
                icon={parkingIcon(spot)}
                position={[spot.latitude, spot.longitude]}
              >
                <Popup>
                  <div className="leaflet-popup-card">
                    <strong>{spot.name}</strong>
                    <span>by {spot.vendorName}</span>
                    <p>{spot.address}</p>
                    <p>
                      <b>{spot.availableSlots}</b> slots available
                      {spot.distance != null ? ` · ${spot.distance.toFixed(1)} km away` : ""}
                    </p>
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => onGetDirections(spot)}
                    >
                      <Navigation size={13} />
                      {isFull ? "Parking Full" : "Get Directions"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <button
          type="button"
          className="lp-locate-btn lp-leaflet-locate"
          onClick={locate}
          disabled={geoState.status === "locating"}
          title="My location"
        >
          {geoState.status === "locating" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LocateFixed size={18} />
          )}
        </button>
      </div>

      <div className="lp-footer">
        <p>
          {visibleSpots.length} parking {visibleSpots.length === 1 ? "spot" : "spots"} found
          {radiusKm ? ` within ${radiusKm} km` : ""} ·{" "}
          {visibleSpots.filter((spot) => spot.availableSlots > 0).length} available
        </p>
      </div>
    </div>
  );
}
