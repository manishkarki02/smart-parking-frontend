import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { getMyParkingLocations } from "@/features/vendor/services/vendor.service";
import { VendorParkingCard } from "@/features/vendor/components/VendorParkingCard";
import { AddParkingForm } from "@/features/vendor/components/AddParkingForm";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/vendor/parking")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "VENDOR") {
      throw redirect({ to: "/" });
    }
  },
  component: VendorParkingPage,
});

function VendorParkingPage() {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: queryKeys.vendor.myLocations,
    queryFn: getMyParkingLocations,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Parking Locations</h1>
        <p className="text-muted-foreground mt-1">
          Manage your parking locations and available slots
        </p>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList>
          <TabsTrigger value="locations">My Locations</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="mt-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No parking locations yet</p>
              <p className="text-sm">
                Add your first parking location to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <VendorParkingCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <AddParkingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
