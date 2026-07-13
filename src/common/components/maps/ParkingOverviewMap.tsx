import { useEffect, useRef, useState } from "react";
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  ControlPosition,
  MapControl,
} from "@vis.gl/react-google-maps";
import { CalendarPlus, Loader2, LocateFixed } from "lucide-react";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { useGeolocation } from "../../hooks/maps/useGeolocation";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ParkingPin({ spot }: { spot: ParkingLocation }) {
  const isFull = spot.availableSlots === 0;
  const isLow = spot.availableSlots <= 3;
  const bg = isFull ? "#ef4444" : isLow ? "#f97316" : "#22c55e";

  return (
    <div
      style={{
        background: bg,
        color: "#fff",
        borderRadius: "8px",
        padding: "4px 8px",
        fontSize: "12px",
        fontWeight: 700,
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        border: "2px solid #fff",
        whiteSpace: "nowrap",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
        cursor: "pointer",
        minWidth: "36px",
        textAlign: "center",
      }}
    >
      <span>{isFull ? "FULL" : spot.availableSlots}</span>
      <span style={{ fontSize: "9px", opacity: 0.85 }}>slots</span>
    </div>
  );
}

function ParkingInfoWindow({
  spot,
  onClose,
  onBook,
}: {
  spot: ParkingLocation;
  onClose: () => void;
  onBook: (spot: ParkingLocation) => void;
}) {
  const isFull = spot.availableSlots === 0;

  return (
    <InfoWindow
      position={{ lat: spot.latitude, lng: spot.longitude }}
      onCloseClick={onClose}
      pixelOffset={[0, -40]}
    >
      <div style={{ width: "200px", fontFamily: "sans-serif" }}>
        <p style={{ fontWeight: 700, fontSize: "14px", margin: "0 0 2px" }}>
          {spot.name}
        </p>
        <p style={{ fontSize: "11px", color: "#888", margin: "0 0 8px" }}>
          by {spot.vendorName}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "12px",
            color: "#555",
          }}
        >
          <span>
            🅿️ Available:{" "}
            <strong style={{ color: isFull ? "#ef4444" : "#22c55e" }}>
              {spot.availableSlots} slots
            </strong>
          </span>
          <span style={{ fontSize: "11px", color: "#888" }}>
            📌 {spot.address}
          </span>
          {typeof spot.distance === "number" &&
            Number.isFinite(spot.distance) && (
            <span>📍 {spot.distance.toFixed(1)} km away</span>
          )}
        </div>

        <button
          onClick={() => onBook(spot)}
          disabled={isFull}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "6px 12px",
            background: isFull ? "#d1d5db" : "#3b82f6",
            color: isFull ? "#6b7280" : "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: isFull ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <CalendarPlus size={12} />
          {isFull ? "Parking Full" : "Book a Space"}
        </button>
      </div>
    </InfoWindow>
  );
}

function UserMarker({ lat, lng }: { lat: number; lng: number }) {
  return (
    <AdvancedMarker position={{ lat, lng }}>
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#3b82f6",
          border: "3px solid #fff",
          boxShadow: "0 0 0 3px rgba(59,130,246,0.3)",
        }}
      />
    </AdvancedMarker>
  );
}

interface ParkingOverviewMapProps {
  spots: ParkingLocation[];
  onBook: (spot: ParkingLocation) => void;
  defaultCenter?: { lat: number; lng: number };
  radiusKm?: number;
}

export function ParkingOverviewMap({
  spots,
  onBook,
  defaultCenter = DEFAULT_CENTER,
  radiusKm,
}: ParkingOverviewMapProps) {
  const map = useMap();
  const { state: geoState, locate } = useGeolocation();
  const [selectedSpot, setSelectedSpot] = useState<ParkingLocation | null>(null);
  const hasAutoLocated = useRef(false);

  // Auto-locate once on mount
  useEffect(() => {
    if (!hasAutoLocated.current) {
      hasAutoLocated.current = true;
      locate();
    }
  }, [locate]);

  // Pan to user when located
  useEffect(() => {
    if (geoState.status === "located" && map) {
      map.panTo({ lat: geoState.lat, lng: geoState.lng });
      map.setZoom(14);
    }
  }, [geoState, map]);

  const userLat = geoState.status === "located" ? geoState.lat : null;
  const userLng = geoState.status === "located" ? geoState.lng : null;

  // Compute distance from user for each spot
  const enrichedSpots: ParkingLocation[] = spots.map((spot) => ({
    ...spot,
    distance:
      userLat != null && userLng != null
        ? haversineKm(userLat, userLng, spot.latitude, spot.longitude)
        : spot.distance, // fall back to server-provided distance
  }));

  // Filter by radius if provided
  const visibleSpots =
    radiusKm != null && userLat != null && userLng != null
      ? enrichedSpots.filter((s) => (s.distance ?? Infinity) <= radiusKm)
      : enrichedSpots;

  return (
    <div className="lp-wrapper">
      {geoState.status === "locating" && (
        <div
          className="lp-search-row"
          style={{ justifyContent: "center", gap: "8px" }}
        >
          <Loader2 size={16} className="animate-spin" />
          <span style={{ fontSize: "13px" }}>Finding your location…</span>
        </div>
      )}

      <div className="lp-map-area">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="parking-overview"
          disableDefaultUI
          gestureHandling="greedy"
        >
          {userLat != null && userLng != null && (
            <UserMarker lat={userLat} lng={userLng} />
          )}

          {visibleSpots.map((spot) => (
            <AdvancedMarker
              key={spot.id}
              position={{ lat: spot.latitude, lng: spot.longitude }}
              onClick={() => setSelectedSpot(spot)}
            >
              <ParkingPin spot={spot} />
            </AdvancedMarker>
          ))}

          {selectedSpot && (
            <ParkingInfoWindow
              spot={selectedSpot}
              onClose={() => setSelectedSpot(null)}
              onBook={(spot) => {
                setSelectedSpot(null);
                onBook(spot);
              }}
            />
          )}

          <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <button
              className="lp-locate-btn"
              onClick={locate}
              disabled={geoState.status === "locating"}
              style={{ margin: "0 10px 10px 0" }}
              title="My location"
            >
              {geoState.status === "locating" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LocateFixed
                  size={18}
                  className={
                    geoState.status === "located" ? "text-blue-500" : ""
                  }
                />
              )}
            </button>
          </MapControl>
        </Map>
      </div>

      <div className="lp-footer">
        <p>
          {visibleSpots.length} parking{" "}
          {visibleSpots.length === 1 ? "spot" : "spots"} found
          {radiusKm ? ` within ${radiusKm} km` : ""}
          {" · "}
          {visibleSpots.filter((s) => s.availableSlots > 0).length} available
        </p>
      </div>
    </div>
  );
}
