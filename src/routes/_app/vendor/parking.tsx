import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyParkingLocations } from "@/features/vendor/services/vendor.service";
import { VendorParkingCard } from "@/features/vendor/components/VendorParkingCard";
import { AddParkingForm } from "@/features/vendor/components/AddParkingForm";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/common/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";

export const Route = createFileRoute("/_app/vendor/parking")({
  component: VendorParkingPage,
});

function VendorParkingPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Parking Locations"
        description="Manage your parking locations and available slots"
        action={
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-190">
              <DialogHeader className="border-b px-6 py-5 sm:px-8">
                <DialogTitle className="text-2xl font-semibold">
                  Add location
                </DialogTitle>
              </DialogHeader>
              <AddParkingForm
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={() => setIsAddModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="rounded-none sm:rounded-lg p-6 overflow-hidden">
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
      </Card>
    </div>
  );
}
