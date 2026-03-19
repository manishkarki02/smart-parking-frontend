import type { ParkingLocation } from "../types/parking.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Car } from "lucide-react";

interface ParkingCardProps {
  location: ParkingLocation;
  onBook?: (location: ParkingLocation) => void;
}

export function ParkingCard({ location, onBook }: ParkingCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{location.name}</CardTitle>
          <Badge variant={location.availableSlots > 0 ? "default" : "destructive"}>
            {location.availableSlots > 0
              ? `${location.availableSlots} slots`
              : "Full"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{location.address}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Car className="h-4 w-4 flex-shrink-0" />
          <span>Managed by {location.vendorName}</span>
        </div>

        {location.distance !== undefined && location.distance > 0 && (
          <p className="text-sm text-muted-foreground">
            📍 {location.distance.toFixed(2)} km away
          </p>
        )}

        {onBook && location.availableSlots > 0 && (
          <Button
            className="w-full mt-2"
            size="sm"
            onClick={() => onBook(location)}
          >
            Book This Spot
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
