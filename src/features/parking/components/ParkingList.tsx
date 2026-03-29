import type { ParkingLocation } from "../types/parking.types";
import { ParkingCard } from "./ParkingCard";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";

interface ParkingListProps {
  locations: ParkingLocation[];
  isLoading: boolean;
  onBook?: (location: ParkingLocation) => void;
}

export function ParkingList({ locations, isLoading, onBook }: ParkingListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const safeLocations = locations || [];

  if (safeLocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No parking spots found</p>
        <p className="text-sm">Try searching for nearby locations</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {safeLocations.map((location) => (
        <ParkingCard key={location.id} location={location} onBook={onBook} />
      ))}
    </div>
  );
}
