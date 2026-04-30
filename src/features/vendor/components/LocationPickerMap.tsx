import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Crosshair, Loader2, Maximize2, Minimize2, Search, X } from "lucide-react";

// Fix default Leaflet icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface PickerLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

/** Inner component that listens for map clicks */
function LocationClickHandler({ onMapClick }: LocationClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationPickerMapProps {
  value: PickerLocation | null;
  onChange: (coords: PickerLocation) => void;
  /** Default center when no pin is set yet. Defaults to Kathmandu */
  defaultCenter?: { lat: number; lng: number };
}

export function LocationPickerMap({
  value,
  onChange,
  defaultCenter = { lat: 27.7172, lng: 85.324 },
}: LocationPickerMapProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Prevent debounce search when user explicitly selects a result
  const [ignoreNextSearch, setIgnoreNextSearch] = useState(false);

  // Keep the marker in sync when value changes programmatically
  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    }
  }, [value]);

  const placeMarkerAndGeocode = useCallback(
    async (lat: number, lng: number, knownAddress?: string) => {
      if (knownAddress) {
        onChange({ lat, lng, address: knownAddress });
        return;
      }
      
      // Update coords immediately; show "Fetching address..." 
      onChange({ lat, lng, address: "Fetching address..." });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
          onChange({ lat, lng, address: data.display_name });
        } else {
          onChange({ lat, lng, address: "Unknown location" });
        }
      } catch {
        onChange({ lat, lng, address: "Unknown location" });
      }
    },
    [onChange]
  );

  const center: [number, number] = value
    ? [value.lat, value.lng]
    : [defaultCenter.lat, defaultCenter.lng];

  // Fullscreen
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
      // Re-calculate map dimensions after fullscreen transition
      setTimeout(() => mapRef.current?.invalidateSize(), 150);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Locate me
  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        mapRef.current!.flyTo([lat, lng], 17, { animate: true, duration: 1 });
        placeMarkerAndGeocode(lat, lng);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Debounce Search
  useEffect(() => {
    if (ignoreNextSearch) {
      setIgnoreNextSearch(false);
      return;
    }
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            q
          )}&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, ignoreNextSearch]);

  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    mapRef.current?.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    
    // Explicitly set the name and skip the next debounced search
    placeMarkerAndGeocode(lat, lng, r.display_name);
    setIgnoreNextSearch(true);
    setSearchQuery(r.display_name.split(",")[0]);
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`location-picker-map-wrapper${isFullscreen ? " lp-fullscreen" : ""}`}
    >
      <div className="lp-map-tile" style={{ position: "relative" }}>
        <MapContainer
          center={center}
          zoom={13}
          zoomControl={false}
          style={{ height: "280px", width: "100%", borderRadius: "0.5rem", zIndex: 0 }}
          ref={mapRef}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationClickHandler
            onMapClick={(lat, lng) => {
              placeMarkerAndGeocode(lat, lng);
            }}
          />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              ref={markerRef}
              eventHandlers={{
                dragend(e) {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  placeMarkerAndGeocode(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>

        {/* ── Search bar inside the map ── */}
        <div
          className="lp-search-bar"
          ref={searchRef}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "50px", // leave space for controls on the right
            zIndex: 1000,
          }}
        >
          <div className="lp-search-input-row hover:shadow-md">
            <Search size={15} className="lp-search-icon" />
            <input
              className="lp-search-input"
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching ? (
              <Loader2 size={13} className="lp-spin" style={{ color: "var(--muted-foreground)" }} />
            ) : searchQuery ? (
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

          {searchResults.length > 0 && (
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

        {/* ── Floating controls ── */}
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
          <span>{value.address}</span>
        </p>
      ) : (
        <p className="location-picker-hint">Click on the map to pin the parking location</p>
      )}
    </div>
  );
}
