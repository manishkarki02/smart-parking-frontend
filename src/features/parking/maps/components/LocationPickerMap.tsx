import { useCallback, useEffect, useRef, useState } from "react";
import {
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
  ControlPosition,
  MapControl,
} from "@vis.gl/react-google-maps";
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
import { useReverseGeocode } from "../hooks/useReverseGeocode";
import type { PickerLocation } from "../types/map.types";
import { ENV } from "@/config/env-constant";
import { useGeolocation } from "../hooks/useGeoLocation";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

// ── Autocomplete — must be inside the Map tree ──
function PlaceAutocomplete({
  onPlaceSelect,
  inputRef,
}: {
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
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
      map.panTo({ lat, lng });
      map.setZoom(17);
      onPlaceSelect(lat, lng, place.formatted_address || "");
    });
  }, [placesLib, map, onPlaceSelect, inputRef]);

  return null;
}

interface LocationPickerMapProps {
  value: PickerLocation | null;
  onChange: (location: PickerLocation) => void;
  defaultCenter?: { lat: number; lng: number };
}

export function LocationPickerMap({
  value,
  onChange,
  defaultCenter = DEFAULT_CENTER,
}: LocationPickerMapProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(13);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { state: geoState, locate } = useGeolocation();

  const { data: resolvedAddress, isFetching: isGeocoding } = useReverseGeocode(
    value?.lat,
    value?.lng,
    ENV.VITE_GOOGLE_MAPS_API_KEY,
    !value?.address
  );

  // Write resolved address back into value
  useEffect(() => {
    if (resolvedAddress && value && !value.address) {
      onChange({ ...value, address: resolvedAddress });
    }
  }, [resolvedAddress]);

  // Pan + set marker when geolocation resolves
  useEffect(() => {
    if (geoState.status === "located" && map) {
      map.panTo({ lat: geoState.lat, lng: geoState.lng });
      map.setZoom(18);
      setZoom(18);
      onChange({ lat: geoState.lat, lng: geoState.lng });
    }
  }, [geoState, map]);

  const handleMapClick = (e: {
    detail: { latLng: { lat: number; lng: number } };
  }) => {
    onChange({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
  };

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
      onChange({ lat, lng, address });
      setZoom(17);
    },
    [onChange]
  );

  const locateIcon =
    geoState.status === "locating" ? (
      <Loader2 size={18} className="animate-spin" />
    ) : geoState.status === "located" ? (
      <LocateFixed size={18} className="text-blue-500" />
    ) : (
      <LocateOff size={18} />
    );

  return (
    <div
      ref={wrapperRef}
      className={`lp-wrapper${isFullscreen ? " lp-wrapper--fullscreen" : ""}`}
    >
      {/* Search Bar */}
      <div className="lp-search-row">
        <span className="lp-search-icon-wrap">
          <Search size={16} />
        </span>
        <input
          ref={searchInputRef}
          className="lp-search-input"
          placeholder="Search for your parking location…"
          type="text"
          autoComplete="off"
        />
      </div>

      <PlaceAutocomplete onPlaceSelect={onPlaceSelect} inputRef={searchInputRef} />

      {/* Map */}
      <div className="lp-map-area">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={defaultCenter}
          defaultZoom={zoom}
          mapId="vendor-location-picker"
          onClick={handleMapClick}
          disableDefaultUI
          gestureHandling="greedy"
          onZoomChanged={(ev) => setZoom(ev.detail.zoom)}
        >
          {value && (
            <AdvancedMarker
              position={{ lat: value.lat, lng: value.lng }}
              draggable
              onDragEnd={(e) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat != null && lng != null) onChange({ lat, lng });
              }}
            >
              <Pin background="#fbbc04" glyphColor="#000" borderColor="#000" />
            </AdvancedMarker>
          )}

          <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "center",
                marginRight: "10px",
                marginBottom: "8px",
              }}
            >
              <button
                className={`lp-locate-btn${geoState.status === "locating" ? " lp-locate-btn--locating" : ""}${geoState.status === "located" ? " lp-locate-btn--located" : ""}`}
                onClick={locate}
                disabled={geoState.status === "locating"}
                title={
                  geoState.status === "locating"
                    ? "Finding your location…"
                    : geoState.status === "located"
                    ? "Location found"
                    : "Use my location"
                }
              >
                {locateIcon}
              </button>

              <div className="lp-control-group">
                <button className="lp-icon-btn" title="Zoom in" onClick={zoomIn}>
                  <Plus size={16} />
                </button>
                <span className="lp-divider" />
                <button className="lp-icon-btn" title="Zoom out" onClick={zoomOut}>
                  <Minus size={16} />
                </button>
                <span className="lp-divider" />
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

      {/* Footer */}
      <div className="lp-footer">
        {value ? (
          <p>
            📍{" "}
            {isGeocoding
              ? "Locating address…"
              : value.address ||
                `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
          </p>
        ) : (
          <p>Click the map or drag the pin to select your parking location</p>
        )}
      </div>
    </div>
  );
}