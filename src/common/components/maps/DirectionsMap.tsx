import { useEffect, useRef } from "react";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Loader2, AlertCircle } from "lucide-react";
import { useDirections } from "../../hooks/maps/useDirections";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

function DirectionsRenderer({ result }: { result: google.maps.DirectionsResult }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map || !result || !routesLib) return;

    if (!rendererRef.current) {
      rendererRef.current = new routesLib.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#3b82f6",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
    }

    rendererRef.current.setMap(map);
    rendererRef.current.setDirections(result);

    return () => {
      rendererRef.current?.setMap(null);
    };
  }, [map, result, routesLib]);

  return null;
}

interface DirectionsMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  destinationName?: string;
}

export function DirectionsMap({
  origin,
  destination,
  destinationName,
}: DirectionsMapProps) {
  const { raw, isLoading, error, distance, duration } = useDirections(
    origin,
    destination
  );

  return (
    <div className="lp-wrapper">
      {/* Header */}
      <div
        className="lp-search-row"
        style={{
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600 }}>
          🚗 {destinationName || "Parking Spot"}
        </span>

        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            <Loader2 size={14} className="animate-spin" />
            <span>Calculating route…</span>
          </div>
        )}

        {!isLoading && !error && distance && duration && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#111",
            }}
          >
            <span>🛣 {distance}</span>
            <span>⏱ {duration}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#ef4444",
              fontSize: "12px",
            }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="lp-map-area">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={origin ?? DEFAULT_CENTER}
          defaultZoom={13}
          mapId="directions-map"
          disableDefaultUI
          gestureHandling="greedy"
        >
          {!!raw && <DirectionsRenderer result={raw} />}
        </Map>
      </div>

      {/* Footer */}
      <div className="lp-footer">
        {!isLoading && !error && distance && duration ? (
          <p>
            🚗 {distance} · {duration} · {destinationName || "Destination"}
          </p>
        ) : (
          <p>Loading directions…</p>
        )}
      </div>
    </div>
  );
}
