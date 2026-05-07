import { useCallback, useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
  ControlPosition,
  MapControl,
} from "@vis.gl/react-google-maps";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Loader2,
  LocateFixed,
  LocateOff,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Search,
} from "lucide-react";

// --- Types ---
export interface PickerLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerMapProps {
  apiKey: string;
  value: PickerLocation | null;
  onChange: (location: PickerLocation) => void;
  defaultCenter?: { lat: number; lng: number };
}

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 }; // Kathmandu

const geocodingClient = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
});

async function reverseGeocode(lat: number, lng: number, apiKey: string): Promise<string> {
  const { data } = await geocodingClient.get("/geocode/json", {
    params: { latlng: `${lat},${lng}`, key: apiKey },
  });
  if (data.status !== "OK") throw new Error(`Geocoding failed: ${data.status}`);
  return data.results[0]?.formatted_address ?? "Unknown location";
}

// --- Autocomplete hook component (must live inside APIProvider) ---
const PlaceAutocomplete = ({
  onPlaceSelect,
  inputRef,
}: {
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib || !inputRef.current || !map) return;

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || "";
      map.panTo({ lat, lng });
      map.setZoom(17);
      onPlaceSelect(lat, lng, address);
    });
  }, [placesLib, map, onPlaceSelect, inputRef]);

  return null;
};

// --- Main Content Component (must live inside APIProvider) ---
function MapContent({
  apiKey,
  value,
  onChange,
  defaultCenter = DEFAULT_CENTER,
}: LocationPickerMapProps) {
  const map = useMap();

  // ── Zoom: track in state so we control it properly ──
  const [zoom, setZoom] = useState(13);

  // ── Locate me: 3 states — idle | locating | located ──
  type LocateState = "idle" | "locating" | "located";
  const [locateState, setLocateState] = useState<LocateState>("idle");

  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // No auto-reset — state persists until user moves the pin themselves

  // Reverse Geocoding
  const { data: resolvedAddress, isFetching: isGeocoding } = useQuery({
    queryKey: ["reverse-geocode", value?.lat, value?.lng],
    queryFn: () => reverseGeocode(value!.lat, value!.lng, apiKey),
    enabled: !!value && !value.address,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (resolvedAddress && value && !value.address) {
      onChange({ ...value, address: resolvedAddress });
    }
  }, [resolvedAddress, value, onChange]);

  // ── Map click: select location — resets locate state (user moved away) ──
  const handleMapClick = (e: { detail: { latLng: { lat: number; lng: number } } }) => {
    setLocateState("idle");
    onChange({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
  };

  // ── Zoom helpers — update state then imperatively call the API ──
  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const next = Math.min(z + 1, 21);
      map?.setZoom(next);
      return next;
    });
  }, [map]);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(z - 1, 1);
      map?.setZoom(next);
      return next;
    });
  }, [map]);

  // ── Locate me ──
  const locateMe = useCallback(() => {
    if (!navigator.geolocation || !map || locateState === "locating") return;
    setLocateState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        map.panTo({ lat, lng });
        map.setZoom(18);
        setZoom(18);
        onChange({ lat, lng });
        setLocateState("located");
      },
      () => setLocateState("idle"),
    );
  }, [map, onChange, locateState]);

  // ── Fullscreen ──
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const onPlaceSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      setLocateState("idle"); // user searched → no longer on GPS location
      onChange({ lat, lng, address });
      setZoom(17);
    },
    [onChange],
  );

  // ── Locate button icon ──
  // idle / moved away  → LocateOff  (gray — "not tracking")
  // locating           → Loader2    (spinning)
  // located            → LocateFixed (Google blue — "on my location")
  const locateIcon =
    locateState === "locating" ? (
      <Loader2 size={18} className="animate-spin" />
    ) : locateState === "located" ? (
      <LocateFixed size={18} />
    ) : (
      <LocateOff size={18} />
    );

  return (
    <div ref={wrapperRef} className={`lp-wrapper${isFullscreen ? " lp-wrapper--fullscreen" : ""}`}>
      {/* ── Search Bar ── */}
      <div className="lp-search-row">
        <span className="lp-search-icon-wrap">
          <Search size={16} />
        </span>
        <input
          ref={searchInputRef}
          className="lp-search-input"
          placeholder="Search for a location…"
          type="text"
          autoComplete="off"
        />
      </div>

      {/* Autocomplete hook — must be inside APIProvider+Map tree */}
      <PlaceAutocomplete onPlaceSelect={onPlaceSelect} inputRef={searchInputRef} />

      {/* ── Map ── */}
      <div className="lp-map-area">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={defaultCenter}
          // ⚠️  Do NOT pass `center` as a controlled prop — it prevents dragging.
          //    We only pan imperatively (map.panTo) when needed.
          defaultZoom={zoom}
          mapId="YOUR_MAP_ID"
          onClick={handleMapClick}
          disableDefaultUI={true}
          gestureHandling="greedy" // allows single-finger drag on mobile
          onZoomChanged={(ev) => setZoom(ev.detail.zoom)}
        >
          {value && (
            <AdvancedMarker
              position={{ lat: value.lat, lng: value.lng }}
              draggable={true}
              onDragEnd={(e) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat && lng) {
                  setLocateState("idle"); // dragged away from GPS location
                  onChange({ lat, lng });
                }
              }}
            >
              <Pin background={"#fbbc04"} glyphColor={"#000"} borderColor={"#000"} />
            </AdvancedMarker>
          )}

          {/* ── Locate Me — standalone card (Google Maps style) ── */}
          <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <div style={{ marginRight: "10px", marginBottom: "8px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              {/* Standalone locate button */}
              <button
                className={`lp-locate-btn${locateState === "locating" ? " lp-locate-btn--locating" : ""}${locateState === "located" ? " lp-locate-btn--located" : ""}`}
                onClick={locateMe}
                disabled={locateState === "locating"}
                title={
                  locateState === "locating"
                    ? "Finding your location…"
                    : locateState === "located"
                      ? "Location found!"
                      : "Use my location"
                }
              >
                {locateIcon}
              </button>

              {/* Zoom + Fullscreen pill */}
              <div className="lp-control-group">
                {/* Zoom in */}
                <button className="lp-icon-btn" title="Zoom in" onClick={zoomIn}>
                  <Plus size={16} />
                </button>

                <span className="lp-divider" />

                {/* Zoom out */}
                <button className="lp-icon-btn" title="Zoom out" onClick={zoomOut}>
                  <Minus size={16} />
                </button>

                <span className="lp-divider" />

                {/* Fullscreen */}
                <button
                  className="lp-icon-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>
          </MapControl>
        </Map>
      </div>

      {/* ── Footer ── */}
      <div className="lp-footer">
        {value ? (
          <p>
            📍{" "}
            {isGeocoding
              ? "Locating address…"
              : value.address || `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`}
          </p>
        ) : (
          <p>Click the map to select a location</p>
        )}
      </div>
    </div>
  );
}

// --- Exported Component ---
export function LocationPickerMap2(props: LocationPickerMapProps) {
  return (
    <APIProvider apiKey={props.apiKey} libraries={["places", "marker"]}>
      <MapContent {...props} />
    </APIProvider>
  );
}
