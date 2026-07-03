import type { ParkingLocation } from "../types/parking.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Car, Circle } from "lucide-react";

interface ParkingCardProps {
  location: ParkingLocation;
  onBook?: (location: ParkingLocation) => void;
}

export function ParkingCard({ location, onBook }: ParkingCardProps) {
  const isAvailable = location.availableSlots > 0;
  return (
    <Card 
      className={`relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-white border-border`}
    >
      {/* Top Indicator Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 ${
          isAvailable ? 'bg-[#10B981]' : 'bg-[#EF4444]'
        }`} 
      />

      <CardHeader className="pb-3 pt-6 px-5">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            {location.name}
          </CardTitle>
          
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-sm font-medium">
            <Circle 
              className={`h-2.5 w-2.5 fill-current ${
                isAvailable ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`} 
            />
            <span className={isAvailable ? 'text-[#10B981]' : 'text-[#EF4444]'}>
              {isAvailable ? `${location.availableSlots} Available` : "Full"}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-5 pb-5">
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/70" />
            <span className="leading-snug">{location.address}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Car className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            <span>Managed by <span className="font-medium text-foreground">{location.vendorName}</span></span>
          </div>

          {typeof location.distance === "number" &&
            Number.isFinite(location.distance) &&
            location.distance > 0 && (
            <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
              📍 {location.distance.toFixed(2)} km away
            </div>
          )}
        </div>

        {onBook && isAvailable && (
          <Button
            className="w-full mt-4 shadow-sm"
            size="default"
            onClick={() => onBook(location)}
          >
            Book This Spot
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
