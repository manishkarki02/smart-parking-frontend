import { useState } from "react";
import type { ParkingLocation } from "@/features/parking/types/parking.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Settings2 } from "lucide-react";
import { UpdateSlotsDialog } from "./UpdateSlotsDialog";

interface VendorParkingCardProps {
  location: ParkingLocation;
}

export function VendorParkingCard({ location }: VendorParkingCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{location.name}</CardTitle>
            <Badge variant="secondary">
              {location.availableSlots} available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location.address}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            📍 Lat: {location.latitude.toFixed(5)}, Lng:{" "}
            {location.longitude.toFixed(5)}
          </div>

          <Button
            size="sm"
            className="w-full mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Update Slots
          </Button>
        </CardContent>
      </Card>

      <UpdateSlotsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parkingId={location.id}
        parkingName={location.name}
        currentSlots={location.availableSlots}
      />
    </>
  );
}
