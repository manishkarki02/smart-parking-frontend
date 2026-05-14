import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import {
  Loader2,
  LocateFixed,
  LocateOff,
  Maximize2,
  Minimize2,
  Search,
  X,
} from "lucide-react";
import useDebounce from "@/common/hooks/useDebounce";
import type { LatLng, PickerLocation } from "../types/map.types";
import {
  type LeafletSearchResult,
  useLeafletLocationSearch,
  useLeafletReverseGeocode,
} from "../hooks/useLeafletGeocode";

const DEFAULT_CENTER: LatLng = { lat: 27.7172, lng: 85.324 };

const pickerIcon = L.divIcon({
  className: "leaflet-picker-pin",
  html: `<span></span>`,
  iconSize: [34, 42],
  iconAnchor: [17, 39],
});

function MapClickHandler({
  onPick,
}: {
  onPick: (location: LatLng) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function MapFlyTo({ location, zoom }: { location: LatLng | null; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], zoom, {
      animate: true,
      duration: 0.75,
    });
  }, [location, map, zoom]);

  return null;
}

interface LeafletLocationPickerMapProps {
  value: PickerLocation | null;
  onChange: (location: PickerLocation) => void;
  defaultCenter?: LatLng;
}

export function LeafletLocationPickerMap({
  value,
  onChange,
  defaultCenter = DEFAULT_CENTER,
}: LeafletLocationPickerMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<LatLng | null>(null);
  const debouncedQuery = useDebounce(activeQuery, 450);

  const { data: resolvedAddress, isFetching: isGeocoding } =
    useLeafletReverseGeocode(pendingCoords?.lat, pendingCoords?.lng, !!pendingCoords);

  const { data: searchResults = [], isFetching: isSearching } =
    useLeafletLocationSearch(debouncedQuery);

  const initialCenter = useMemo<[number, number]>(
    () => [defaultCenter.lat, defaultCenter.lng],
    [defaultCenter.lat, defaultCenter.lng],
  );

  useEffect(() => {
    if (!pendingCoords || resolvedAddress == null) return;
    onChange({ ...pendingCoords, address: resolvedAddress });
  }, [onChange, pendingCoords, resolvedAddress]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickLocation = useCallback(
    (location: LatLng) => {
      onChange({ ...location, address: "Resolving address..." });
      setPendingCoords(location);
    },
    [onChange],
  );

  const selectSearchResult = (result: LeafletSearchResult) => {
    const location = { lat: result.lat, lng: result.lng };
    onChange({ ...location, address: result.label });
    setSearchValue(result.label.split(",")[0] ?? result.label);
    setActiveQuery("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchValue("");
    setActiveQuery("");
    setShowResults(false);
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrapperRef.current.requestFullscreen();
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { lat: coords.latitude, lng: coords.longitude };
        map?.flyTo([location.lat, location.lng], 17, {
          animate: true,
          duration: 0.75,
        });
        pickLocation(location);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`lp-wrapper${isFullscreen ? " lp-wrapper--fullscreen" : ""}`}
    >
      <div className="lp-search-row lp-search-row--large" ref={searchRef}>
        <span className="lp-search-icon-wrap">
          <Search size={22} />
        </span>
        <input
          className="lp-search-input lp-search-input--large"
          placeholder="Search for your parking location..."
          type="text"
          value={searchValue}
          onChange={(event) => {
            const next = event.target.value;
            setSearchValue(next);
            setActiveQuery(next);
            setShowResults(next.trim().length > 1);
          }}
        />
        {isSearching ? (
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        ) : searchValue ? (
          <button
            type="button"
            className="lp-search-clear"
            title="Clear search"
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        ) : null}

        {showResults && searchResults.length > 0 && (
          <ul className="lp-search-results">
            {searchResults.map((result) => (
              <li key={result.placeId}>
                <button type="button" onMouseDown={() => selectSearchResult(result)}>
                  <Search size={14} />
                  <span>{result.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lp-map-area lp-map-area--picker">
        <MapContainer
          center={initialCenter}
          zoom={13}
          zoomControl={false}
          className="h-full w-full"
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <MapClickHandler onPick={pickLocation} />
          <MapFlyTo
            location={value ? { lat: value.lat, lng: value.lng } : null}
            zoom={value ? 17 : 13}
          />

          {value && (
            <Marker
              draggable
              icon={pickerIcon}
              position={[value.lat, value.lng]}
              eventHandlers={{
                dragend(event) {
                  const { lat, lng } = (event.target as L.Marker).getLatLng();
                  pickLocation({ lat, lng });
                },
              }}
            />
          )}
        </MapContainer>

        <div className="lp-leaflet-controls">
          <button
            type="button"
            className={`lp-locate-btn${isLocating ? " lp-locate-btn--locating" : ""}${value ? " lp-locate-btn--located" : ""}`}
            onClick={locate}
            disabled={isLocating}
            title="Use my location"
          >
            {isLocating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : value ? (
              <LocateFixed size={18} />
            ) : (
              <LocateOff size={18} />
            )}
          </button>
          <button
            type="button"
            className="lp-locate-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="lp-footer">
        {value ? (
          <p>
            {isGeocoding
              ? "Resolving address..."
              : value.address || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
          </p>
        ) : (
          <p>Click the map or drag the pin to select your parking location</p>
        )}
      </div>
    </div>
  );
}
