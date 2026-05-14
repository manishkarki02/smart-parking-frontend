import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useQuery } from "@tanstack/react-query";
import {
  Crosshair,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  X,
} from "lucide-react";
import axios from "axios";
import useDebounce from "@/common/hooks/useDebounce";

// ─── Fix Leaflet default icon paths broken by bundlers ───────────────────────
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

// ─── Nominatim fetchers ───────────────────────────────────────────────────────
const nominatim = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  headers: {
    "Accept-Language": "en",
    Referer: window.location.origin,
  },
});

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const { data } = await nominatim.get("/reverse", {
    params: { format: "json", lat, lon: lng, zoom: 18, addressdetails: 1 },
  });
  return data?.display_name ?? "Unknown location";
}

async function searchLocations(query: string): Promise<NominatimResult[]> {
  const { data } = await nominatim.get("/search", {
    params: { format: "json", q: query, limit: 6 },
  });
  return data;
}

// ─── Inner map click handler ──────────────────────────────────────────────────

function LocationClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LocationPickerMapProps {
  value: PickerLocation | null;
  onChange: (coords: PickerLocation) => void;
  /** Default map center when no pin is placed yet. Defaults to Kathmandu. */
  defaultCenter?: { lat: number; lng: number };
}

export function LocationPickerMap({
  value,
  onChange,
  defaultCenter = { lat: 27.7172, lng: 85.324 },
}: LocationPickerMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // ── Pending coords: the lat/lng awaiting reverse geocoding ──────────────────
  // Kept separate from `value` so react-query can drive the address resolution.
  const [pendingCoords, setPendingCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ── Search: two separate states ─────────────────────────────────────────────
  // FIX #1 (replaces ignoreNextSearch flag):
  //   searchInputValue → what the <input> shows (updated by both user typing AND result selection)
  //   activeQuery      → what actually triggers the API call (ONLY updated on user keystrokes)
  // Selecting a result updates the display without ever touching activeQuery,
  // so no debounced search fires after selection.
  const [searchInputValue, setSearchInputValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const debouncedQuery = useDebounce(activeQuery, 500);

  // ── react-query: reverse geocoding ─────────────────────────────────────────
  const { data: resolvedAddress, isFetching: isGeocoding } = useQuery({
    queryKey: ["reverse-geocode", pendingCoords?.lat, pendingCoords?.lng],
    queryFn: () => reverseGeocode(pendingCoords!.lat, pendingCoords!.lng),
    enabled: !!pendingCoords,
    staleTime: Infinity, // same coordinates always resolve to the same address
    retry: 1,
  });

  // When the address resolves, push the complete location up to the parent
  useEffect(() => {
    if (pendingCoords && resolvedAddress !== undefined) {
      onChange({ ...pendingCoords, address: resolvedAddress });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAddress, pendingCoords]);

  // ── react-query: location search ────────────────────────────────────────────
  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["location-search", debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Show the dropdown when fresh results arrive
  useEffect(() => {
    if (searchResults.length > 0) setShowResults(true);
  }, [searchResults]);

  // ── FIX #2: Pan map when value changes externally ───────────────────────────
  // MapContainer's `center` prop is immutable after mount, so programmatic
  // changes to `value` must be applied via the map instance directly.
  useEffect(() => {
    if (value && map) {
      map.flyTo([value.lat, value.lng], map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    }
    // Only react to coordinate changes, not address string changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, map]);

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
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => map?.invalidateSize(), 150);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [map]);

  // ── Locate me ────────────────────────────────────────────────────────────────
  const locateMe = () => {
    if (!navigator.geolocation || !map) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        map.flyTo([lat, lng], 17, { animate: true, duration: 1 });
        // Immediately show pin; address will resolve via react-query
        onChange({ lat, lng, address: "Fetching address…" });
        setPendingCoords({ lat, lng });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // ── Map click ────────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      // Immediately render the pin and optimistic address label
      onChange({ lat, lng, address: "Fetching address…" });
      // Kick off react-query reverse geocode
      setPendingCoords({ lat, lng });
    },
    [onChange],
  );

  // ── Select search result ─────────────────────────────────────────────────────
  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);

    map?.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    onChange({ lat, lng, address: r.display_name });

    // FIX #1: Update the input display WITHOUT touching activeQuery,
    // so no debounced search fires after this selection.
    setSearchInputValue(r.display_name.split(",")[0]);
    // activeQuery is intentionally NOT updated here

    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchInputValue("");
    setActiveQuery("");
    setShowResults(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // FIX #2: Pass a fixed initial center (not derived from `value`).
  // The map panning is handled imperatively via useEffect above.
  const initialCenter: [number, number] = [
    defaultCenter.lat,
    defaultCenter.lng,
  ];

  return (
    <div
      ref={wrapperRef}
      className={`location-picker-map-wrapper${isFullscreen ? " lp-fullscreen" : ""}`}
    >
      <div className="lp-map-tile" style={{ position: "relative" }}>
        {/* FIX #4: ref={setMap} — idiomatic pattern per react-leaflet docs */}
        <MapContainer
          center={initialCenter}
          zoom={13}
          zoomControl={false}
          style={{
            height: "280px",
            width: "100%",
            borderRadius: "0.5rem",
            zIndex: 0,
          }}
          ref={setMap}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationClickHandler onMapClick={handleMapClick} />

          {/* FIX #3: Removed the redundant markerRef + useEffect that was
              calling setLatLng manually. React-Leaflet already treats `position`
              as a mutable prop and updates the marker internally. */}
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  onChange({ lat, lng, address: "Fetching address…" });
                  setPendingCoords({ lat, lng });
                },
              }}
            />
          )}
        </MapContainer>

        {/* ── Search bar ────────────────────────────────────────────────────── */}
        <div
          className="lp-search-bar"
          ref={searchRef}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "50px",
            zIndex: 1000,
          }}
        >
          <div className="lp-search-input-row hover:shadow-md">
            <Search size={15} className="lp-search-icon" />
            <input
              className="lp-search-input"
              type="text"
              placeholder="Search for a location..."
              value={searchInputValue}
              onChange={(e) => {
                const v = e.target.value;
                // FIX #1: Both states updated on user keystrokes — the split
                // between display value and query-driving value is what prevents
                // spurious searches after a result is selected.
                setSearchInputValue(v);
                setActiveQuery(v);
                if (v.trim()) setShowResults(true);
              }}
            />
            {isSearching ? (
              <Loader2
                size={13}
                className="lp-spin"
                style={{ color: "var(--muted-foreground)" }}
              />
            ) : searchInputValue ? (
              <button
                type="button"
                className="lp-icon-btn lp-search-clear"
                onClick={clearSearch}
                title="Clear"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          {showResults && searchResults.length > 0 && (
            <ul className="lp-search-results">
              {searchResults.map((r) => (
                <li
                  key={r.place_id}
                  className="lp-search-result-item"
                  onMouseDown={() => selectResult(r)}
                >
                  <Search size={12} className="lp-result-icon" />
                  <span>{r.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

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
