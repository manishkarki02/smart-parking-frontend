import { useState, useCallback } from "react";

export type GeolocationStatus =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "located"; lat: number; lng: number }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationStatus>({ status: "idle" });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation not supported by your browser." });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setState({
          status: "located",
          lat: coords.latitude,
          lng: coords.longitude,
        }),
      (err) => setState({ status: "error", message: err.message }),
      { enableHighAccuracy: true }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, locate, reset };
}