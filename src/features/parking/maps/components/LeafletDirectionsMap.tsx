import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLeafletDirections } from "../hooks/useLeafletDirections";
import type { LatLng } from "../types/map.types";

const originIcon = L.divIcon({
  className: "leaflet-route-origin",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const destinationIcon = L.divIcon({
  className: "leaflet-route-destination",
  html: "<span></span>",
  iconSize: [30, 38],
  iconAnchor: [15, 36],
});

function FitRoute({
  origin,
  destination,
  points,
}: {
  origin: LatLng;
  destination: LatLng;
  points: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = points.length
      ? L.latLngBounds(points)
      : L.latLngBounds([
          [origin.lat, origin.lng],
          [destination.lat, destination.lng],
        ]);
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16 });
  }, [destination, map, origin, points]);

  return null;
}

interface LeafletDirectionsMapProps {
  origin: LatLng;
  destination: LatLng;
  destinationName?: string;
}

export function LeafletDirectionsMap({
  origin,
  destination,
  destinationName,
}: LeafletDirectionsMapProps) {
  const { points, distance, duration, isLoading, error } = useLeafletDirections(
    origin,
    destination,
  );
  const fallbackLine: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];
  const routeLine = points.length > 0 ? points : fallbackLine;

  return (
    <div className="lp-wrapper">
      <div className="lp-search-row justify-between">
        <span className="text-sm font-semibold">
          Route to {destinationName || "Parking Spot"}
        </span>
        {isLoading && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Calculating route...
          </span>
        )}
        {!isLoading && !error && distance && duration && (
          <span className="text-sm font-semibold">
            {distance} · {duration}
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle size={14} />
            Showing direct line
          </span>
        )}
      </div>

      <div className="lp-map-area">
        <MapContainer
          center={[origin.lat, origin.lng]}
          zoom={13}
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <FitRoute origin={origin} destination={destination} points={routeLine} />
          <Polyline positions={routeLine} pathOptions={{ color: "#2563eb", weight: 5 }} />
          <Marker icon={originIcon} position={[origin.lat, origin.lng]} />
          <Marker icon={destinationIcon} position={[destination.lat, destination.lng]} />
        </MapContainer>
      </div>

      <div className="lp-footer">
        <p>
          {distance && duration
            ? `${distance} · ${duration} · ${destinationName || "Destination"}`
            : `Route to ${destinationName || "destination"}`}
        </p>
      </div>
    </div>
  );
}
