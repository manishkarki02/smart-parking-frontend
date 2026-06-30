import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface LatLng {
  lat: number;
  lng: number;
}

interface DirectionsState {
  raw: google.maps.DirectionsResult | null;
  distance: string | null;
  duration: string | null;
  error: string | null;
}

const INITIAL_STATE: DirectionsState = {
  raw: null,
  distance: null,
  duration: null,
  error: null,
};

export function useDirections(origin: LatLng | null, destination: LatLng | null) {
  const routesLib = useMapsLibrary("routes");
  const [state, setState] = useState<DirectionsState>(INITIAL_STATE);

  useEffect(() => {
    // Reset to idle when inputs are cleared
    if (!routesLib || !origin || !destination) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;
    const service = new routesLib.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: routesLib.TravelMode.DRIVING,
      },
      (
        result: google.maps.DirectionsResult | null,
        status: string,
      ) => {
        if (cancelled) return; // stale response — ignore

        if (status === "OK" && result) {
          const leg = result.routes[0]?.legs[0];
          setState({
            raw: result,
            distance: leg?.distance?.text ?? null,
            duration: leg?.duration?.text ?? null,
            error: null,
          });
        } else {
          setState({
            raw: null,
            distance: null,
            duration: null,
            error: `Could not fetch directions: ${status}`,
          });
        }
      }
    );

    // Cancel stale response if deps change before it resolves
    return () => {
      cancelled = true;
    };
  }, [routesLib, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  // Derive loading — we have valid inputs but no result or error yet
  const isLoading = !!(routesLib && origin && destination && !state.raw && !state.error);

  return { ...state, isLoading };
}
