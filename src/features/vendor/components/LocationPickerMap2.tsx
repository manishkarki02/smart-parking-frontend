import { useEffect, useRef, useState, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Crosshair, Loader2, Maximize2, Minimize2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface GeocodingResult {
  results: { formatted_address: string }[];
  status: string;
}

// ─── Libraries array must be stable (defined outside component) ───────────────
// If defined inside, a new array reference on every render causes
// useJsApiLoader to reload the whole Google Maps script each time.
const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

// ─── Axios instance ───────────────────────────────────────────────────────────

const geocodingClient = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
});

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<string> {
  const { data } = await geocodingClient.get<GeocodingResult>("/geocode/json", {
    params: { latlng: `${lat},${lng}`, key: apiKey },
  });
  if (data.status !== "OK") throw new Error(`Geocoding failed: ${data.status}`);
  return data.results[0]?.formatted_address ?? "Unknown location";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LocationPickerMapProps {
  apiKey: string;
  value: PickerLocation | null;
  onChange: (location: PickerLocation) => void;
  defaultCenter?: { lat: number; lng: number };
}

export function LocationPickerMap2({
  apiKey,
  value,
  onChange,
  defaultCenter = { lat: 27.7172, lng: 85.324 },
}: LocationPickerMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Pending coords waiting for reverse geocoding
  const [pendingCoords, setPendingCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ── react-query: reverse geocoding ─────────────────────────────────────────
  const { data: resolvedAddress, isFetching: isGeocoding } = useQuery({
    queryKey: ["reverse-geocode", pendingCoords?.lat, pendingCoords?.lng],
    queryFn: () =>
      reverseGeocode(pendingCoords!.lat, pendingCoords!.lng, apiKey),
    enabled: !!pendingCoords,
    staleTime: Infinity,
    retry: 1,
  });

  // Push resolved address up to parent
  useEffect(() => {
    if (pendingCoords && resolvedAddress !== undefined) {
      onChange({ ...pendingCoords, address: resolvedAddress });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAddress, pendingCoords]);

  // ── Pan map when value changes externally ───────────────────────────────────
  useEffect(() => {
    if (value && map) {
      map.panTo({ lat: value.lat, lng: value.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, map]);

  // ── Map click ────────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onChange({ lat, lng, address: "Fetching address…" });
      setPendingCoords({ lat, lng });
    },
    [onChange],
  );

  // ── Marker drag ──────────────────────────────────────────────────────────────
  const handleMarkerDragEnd = useCallback(
    (e: any) => { // AdvancedMarkerElement uses a different event format or we can use DOM events, but actually google.maps.MapMouseEvent works if we attach it via addListener
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onChange({ lat, lng, address: "Fetching address…" });
      setPendingCoords({ lat, lng });
    },
    [onChange],
  );

  // ── AdvancedMarkerElement hook ───────────────────────────────────────────────
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!isLoaded || !map || !value) return;

    const markerLib = google.maps.marker as any;
    if (!markerLib?.AdvancedMarkerElement) return;

    if (!markerRef.current) {
      markerRef.current = new markerLib.AdvancedMarkerElement({
        map,
        position: { lat: value.lat, lng: value.lng },
        gmpDraggable: true,
      });

      markerRef.current.addListener("dragend", (e: any) => {
        if (e.latLng) {
          handleMarkerDragEnd(e);
        } else if (markerRef.current.position) {
            handleMarkerDragEnd({ latLng: new google.maps.LatLng(markerRef.current.position.lat, markerRef.current.position.lng) });
        }
      });
    } else {
      markerRef.current.position = { lat: value.lat, lng: value.lng };
    }

    return () => {
      // Don't remove marker on every render, let it persist until unmount or map change
    };
  }, [isLoaded, map, value?.lat, value?.lng, handleMarkerDragEnd]);

  useEffect(() => {
    return () => {
        if (markerRef.current) {
            markerRef.current.map = null;
        }
    }
  }, []);

  // ── Places Autocomplete ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !map) return;
    
    // Safety check to ensure library is loaded and element doesn't already exist
    const places = google.maps.places as any;
    if (!places?.PlaceAutocompleteElement || searchContainerRef.current?.firstChild) {
      return;
    }

    const autocompleteElement = new places.PlaceAutocompleteElement();
    
    // Style the element to fit the container
    autocompleteElement.style.width = "100%";
    
    autocompleteElement.addEventListener("gmp-placeselect", async (e: any) => {
      const place = e.place;
      if (!place) return;
      
      // Fetch required fields if they aren't already present
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      if (!place.location) return;

      const lat = place.location.lat();
      const lng = place.location.lng();
      const address = place.formattedAddress ?? place.displayName ?? "Unknown location";

      map.panTo({ lat, lng });
      map.setZoom(16);
      // Address already known from Places — no need to reverse geocode
      onChange({ lat, lng, address });
    });

    if (searchContainerRef.current) {
      searchContainerRef.current.appendChild(autocompleteElement);
    }
    
    return () => {
      // Cleanup to avoid memory leaks
      if (searchContainerRef.current) {
        searchContainerRef.current.innerHTML = "";
      }
    };
  }, [isLoaded, map, onChange]);

  // ── Locate me ────────────────────────────────────────────────────────────────
  const locateMe = () => {
    if (!navigator.geolocation || !map) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        map.panTo({ lat, lng });
        map.setZoom(17);
        onChange({ lat, lng, address: "Fetching address…" });
        setPendingCoords({ lat, lng });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // ── Fullscreen ───────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Render guards ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <p className="location-picker-hint" style={{ color: "red" }}>
        Failed to load Google Maps. Check your API key.
      </p>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="lp-map-tile"
        style={{
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={24} className="lp-spin" />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`location-picker-map-wrapper${isFullscreen ? " lp-fullscreen" : ""}`}
    >
      <div className="lp-map-tile" style={{ position: "relative" }}>
        <GoogleMap
          mapContainerStyle={{
            height: "280px",
            width: "100%",
            borderRadius: "0.5rem",
          }}
          center={
            value
              ? { lat: value.lat, lng: value.lng }
              : { lat: defaultCenter.lat, lng: defaultCenter.lng }
          }
          zoom={13}
          onClick={handleMapClick}
          onLoad={setMap}
          onUnmount={() => setMap(null)}
          options={{
            mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false, // we handle fullscreen ourselves
          }}
        >
          {/* AdvancedMarkerElement is rendered programmatically via useEffect */}
        </GoogleMap>

        {/* ── Search bar (Google Autocomplete) ─────────────────────────────── */}
        <div
          ref={searchContainerRef}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "50px",
            zIndex: 1000,
            background: "white",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        />

        {/* ── Floating controls ─────────────────────────────────────────────── */}
        <div className="lp-controls" style={{ zIndex: 1000 }}>
          <button
            type="button"
            className="lp-icon-btn"
            onClick={locateMe}
            disabled={isLocating}
            title="Use my location"
          >
            {isLocating ? (
              <Loader2 size={15} className="lp-spin" />
            ) : (
              <Crosshair size={15} />
            )}
          </button>
          <button
            type="button"
            className="lp-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {value ? (
        <p className="location-picker-coords">
          📍&nbsp;
          <span>{isGeocoding ? "Fetching address…" : value.address}</span>
        </p>
      ) : (
        <p className="location-picker-hint">
          Click on the map to pin the location
        </p>
      )}
    </div>
  );
}
