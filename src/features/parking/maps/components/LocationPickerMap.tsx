import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdvancedMarker,
  ControlPosition,
  Map,
  MapControl,
  Pin,
  useMap,
  useMapsLibrary,
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
import {
  useGeolocation,
  type GeolocationStatus,
} from "../hooks/useGeolocation";
import type { PickerLocation } from "../types/map.types";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

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

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;

      if (!location) return;

      const lat = location.lat();
      const lng = location.lng();

      map.panTo({ lat, lng });
      map.setZoom(17);

      onPlaceSelect(lat, lng, place.formatted_address ?? "");
    });

    return () => {
      listener.remove();
    };
  }, [placesLib, map, onPlaceSelect, inputRef]);

  return null;
}

function LocationMarker({
  value,
  onChange,
}: {
  value: PickerLocation | null;
  onChange: (location: PickerLocation) => void;
}) {
  if (!value) return null;

  return (
    <AdvancedMarker
      position={{ lat: value.lat, lng: value.lng }}
      draggable
      onDragEnd={(e) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();

        if (lat != null && lng != null) {
          onChange({ lat, lng });
        }
      }}
    >
      <Pin background="#fbbc04" glyphColor="#000" borderColor="#000" />
    </AdvancedMarker>
  );
}

function LocateEffect({
  geoState,
  onLocated,
}: {
  geoState: GeolocationStatus;
  onLocated: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (geoState.status !== "located" || !map) return;

    const position = {
      lat: geoState.lat,
      lng: geoState.lng,
    };

    map.panTo(position);
    map.setZoom(18);
    onLocated(position.lat, position.lng);
  }, [geoState, map, onLocated]);

  return null;
}

function MapControls({
  geoState,
  locate,
  isFullscreen,
  toggleFullscreen,
  setZoom,
}: {
  geoState: GeolocationStatus;
  locate: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}) {
  const map = useMap();

  const zoomIn = useCallback(() => {
    setZoom((currentZoom) => {
      const nextZoom = Math.min(currentZoom + 1, 21);
      map?.setZoom(nextZoom);
      return nextZoom;
    });
  }, [map, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom((currentZoom) => {
      const nextZoom = Math.max(currentZoom - 1, 1);
      map?.setZoom(nextZoom);
      return nextZoom;
    });
  }, [map, setZoom]);

  const locateIcon =
    geoState.status === "locating" ? (
      <Loader2 size={18} className="animate-spin" />
    ) : geoState.status === "located" ? (
      <LocateFixed size={18} className="text-blue-500" />
    ) : (
      <LocateOff size={18} />
    );

  return (
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
          className={`lp-locate-btn${
            geoState.status === "locating" ? " lp-locate-btn--locating" : ""
          }${geoState.status === "located" ? " lp-locate-btn--located" : ""}`}
          onClick={locate}
          disabled={geoState.status === "locating"}
          title={
            geoState.status === "locating"
              ? "Finding your location…"
              : geoState.status === "located"
                ? "Location found"
                : "Use my location"
          }
          type="button"
        >
          {locateIcon}
        </button>

        <div className="lp-control-group">
          <button
            className="lp-icon-btn"
            title="Zoom in"
            onClick={zoomIn}
            type="button"
          >
            <Plus size={16} />
          </button>

          <span className="lp-divider" />

          <button
            className="lp-icon-btn"
            title="Zoom out"
            onClick={zoomOut}
            type="button"
          >
            <Minus size={16} />
          </button>

          <span className="lp-divider" />

          <button
            className="lp-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            type="button"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
    </MapControl>
  );
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
  const [zoom, setZoom] = useState(13);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { state: geoState, locate } = useGeolocation();

  const { data: resolvedAddress, isFetching: isGeocoding } = useReverseGeocode(
    value?.lat,
    value?.lng,
    !value?.address,
  );

  useEffect(() => {
    if (resolvedAddress && value && !value.address) {
      onChange({ ...value, address: resolvedAddress });
    }
  }, [resolvedAddress, value, onChange]);

  const handlePlaceSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      setZoom(17);
      onChange({ lat, lng, address });
    },
    [onChange],
  );

  const handleLocated = useCallback(
    (lat: number, lng: number) => {
      setZoom(18);
      onChange({ lat, lng });
    },
    [onChange],
  );

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, []);

  const center = value
    ? {
        lat: value.lat,
        lng: value.lng,
      }
    : defaultCenter;

  return (
    <div
      ref={wrapperRef}
      className={`lp-wrapper${isFullscreen ? " lp-wrapper--fullscreen" : ""}`}
    >
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

      <div className="lp-map-area">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="vendor-location-picker"
          disableDefaultUI
          gestureHandling="greedy"
          onClick={(ev) => {
            const latLng = ev.detail.latLng;

            if (!latLng) return;

            onChange({
              lat: latLng.lat,
              lng: latLng.lng,
            });
          }}
          onZoomChanged={(ev) => {
            if (typeof ev.detail.zoom === "number") {
              setZoom(ev.detail.zoom);
            }
          }}
        >
          <PlaceAutocomplete
            onPlaceSelect={handlePlaceSelect}
            inputRef={searchInputRef}
          />

          <LocateEffect geoState={geoState} onLocated={handleLocated} />

          <LocationMarker value={value} onChange={onChange} />

          <MapControls
            geoState={geoState}
            locate={locate}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            setZoom={setZoom}
          />
        </Map>
      </div>

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
