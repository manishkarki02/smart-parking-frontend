import { MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";

export function VendorBookingsPageHeader({
  locationId,
  locations,
  onLocationChange,
  onAddBooking,
}: {
  locationId: string;
  locations: ParkingLocation[];
  onLocationChange: (locationId: string) => void;
  onAddBooking: () => void;
}) {
  return (
    <PageHeader
      title="Bookings"
      content={
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
            Bookings
          </h1>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <Select value={locationId} onValueChange={onLocationChange}>
            <SelectTrigger className="h-10 w-full border-slate-200 bg-white shadow-none sm:w-65">
              <MapPin className="size-4 text-slate-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      action={
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onAddBooking}
        >
          <Plus className="size-4" />
          Add on-site booking
        </Button>
      }
    />
  );
}
