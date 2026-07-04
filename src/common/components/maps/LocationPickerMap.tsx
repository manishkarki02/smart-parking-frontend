import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdvancedMarker,
  ControlPosition,
  Map,
  MapControl,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  Loader2,
  LocateFixed,
  LocateOff,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
} from "lucide-react";
import { useReverseGeocode } from "../../hooks/maps/useReverseGeocode";
import {
  useGeolocation,
  type GeolocationStatus,
} from "../../hooks/maps/useGeolocation";
import type { PickerLocation } from "../../types/map.types";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

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

function SelectedLocationEffect({
  value,
  setZoom,
}: {
  value: PickerLocation | null;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!value || !map) return;

    const nextZoom = Math.max(map.getZoom() ?? 13, 17);

    map.panTo({ lat: value.lat, lng: value.lng });
    map.setZoom(nextZoom);
    setZoom(nextZoom);
  }, [map, setZoom, value]);

  return null;
}

function SelectedLocationControl({
  value,
  resolving,
}: {
  value: PickerLocation | null;
  resolving: boolean;
}) {
  if (!value) return null;

  const label = resolving
    ? "Locating address..."
    : value.address || "Selected coordinates";

  return (
    <MapControl position={ControlPosition.TOP_LEFT}>
      <div className="m-3 max-w-[260px] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-slate-900 shadow-lg backdrop-blur-sm">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <MapPin size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Selected location
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-4 text-slate-950">
              {label}
            </p>
            <p className="mt-1 font-mono text-[11px] text-slate-500">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </p>
          </div>
        </div>
      </div>
    </MapControl>
  );
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

  const { state: geoState, locate } = useGeolocation();

  const { data: resolvedAddress, isFetching: isGeocoding } = useReverseGeocode(
    value?.lat,
    value?.lng,
    !!value && !value.address,
  );

  useEffect(() => {
    if (resolvedAddress && value && !value.address) {
      onChange({ ...value, address: resolvedAddress });
    }
  }, [resolvedAddress, value, onChange]);

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
          <SelectedLocationEffect value={value} setZoom={setZoom} />

          <SelectedLocationControl value={value} resolving={isGeocoding} />

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
            {isGeocoding
              ? "Locating address..."
              : value.address ||
                `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
          </p>
        ) : (
          <p>Click the map or drag the pin, then press Done to confirm</p>
        )}
      </div>
    </div>
  );
}
