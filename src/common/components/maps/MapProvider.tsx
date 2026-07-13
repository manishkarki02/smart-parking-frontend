import { APIProvider } from "@vis.gl/react-google-maps";
import { ENV } from "@/config/env-constants";

interface MapProviderProps {
  children: React.ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  return (
    <APIProvider
      apiKey={ENV.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places", "marker", "routes"]}
    >
      {children}
    </APIProvider>
  );
}