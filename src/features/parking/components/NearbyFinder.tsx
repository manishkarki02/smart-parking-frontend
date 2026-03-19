import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getThamelNearby } from "../services/parking.service";
import { queryKeys } from "@/config/query-keys";
import { ParkingList } from "./ParkingList";

export function NearbyFinder() {
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const { data: nearbySpots = [], isLoading } = useQuery({
    queryKey: queryKeys.parking.thamelNearby(
      coords?.lat ?? 0,
      coords?.lng ?? 0,
      5
    ),
    queryFn: () => getThamelNearby(), // Mocked to zero args
    enabled: !!coords,
  });

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
        toast.success("Location found! Searching nearby parking...");
      },
      (error) => {
        setIsLocating(false);
        toast.error(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Find Nearby Parking
        </CardTitle>
        <CardDescription>
          Use your current location to find the closest parking spots in Thamel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleFindNearby} disabled={isLocating}>
          {isLocating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLocating ? "Getting Location..." : "Use My Location"}
        </Button>

        {coords && (
          <p className="text-sm text-muted-foreground">
            Your location: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}

        {coords && (
          <ParkingList locations={nearbySpots} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
}
