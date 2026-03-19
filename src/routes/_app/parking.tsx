import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllSlots } from "@/features/parking/services/parking.service";
import { ParkingList } from "@/features/parking/components/ParkingList";
import { NearbyFinder } from "@/features/parking/components/NearbyFinder";
import { queryKeys } from "@/config/query-keys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ParkingLocation } from "@/features/parking/types/parking.types";

export const Route = createFileRoute("/_app/parking")({
  component: ParkingPage,
});

function ParkingPage() {
  const navigate = useNavigate();

  const { data: allSlots = [], isLoading } = useQuery({
    queryKey: queryKeys.parking.all,
    queryFn: getAllSlots,
  });

  const handleBook = (location: ParkingLocation) => {
    navigate({
      to: "/bookings/new",
      search: { parkingLocationId: location.id },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Parking</h1>
        <p className="text-muted-foreground mt-1">
          Browse available parking spots or find the nearest one to you
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Available</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ParkingList
            locations={allSlots}
            isLoading={isLoading}
            onBook={handleBook}
          />
        </TabsContent>

        <TabsContent value="nearby" className="mt-4">
          <NearbyFinder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
