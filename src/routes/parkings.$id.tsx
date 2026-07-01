import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/common/components/AppLayout";
import { PublicShell } from "@/common/components/PublicShell";
import { useState, useMemo } from "react";
import { SlotGrid } from "@/features/parkings/components/SlotGrid";
import { useAuthStore } from "@/stores/auth-store";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { Button } from "@/components/ui/button";
import { MapPin, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useParkingSlots from "@/features/parkings/hooks/useParkingSlots";
import { queryKeys } from "@/config/query-keys";
import { getParkingSlots } from "@/features/parkings/services/parking.service";
import type { ParkingSlot } from "@/features/parkings/types/parking.types";
import { DriverSlotBookingDialog } from "@/features/bookings/components/DriverSlotBookingDialog";

export const Route = createFileRoute("/parkings/$id")({
  component: ParkingDetailsPage,
});

function ParkingDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const isSignedIn = Boolean(token);

  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { locations, isLoading } = useParkingSlots();

  const location = useMemo(() => {
    return locations?.find((loc) => loc.id === id);
  }, [locations, id]);

  const {
    data: slots = [],
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
  } = useQuery({
    queryKey: queryKeys.parking.slots(id),
    queryFn: () => getParkingSlots(id),
    enabled: Boolean(location),
  });

  const availableSlots = slots.filter((slot) => slot.status === "AVAILABLE");

  const handleSlotSelect = (slot: ParkingSlot) => {
    if (slot.status !== "AVAILABLE") {
      toast.error("Only available slots can be booked.");
      return;
    }

    setSelectedSlot(slot);
    if (!isSignedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsBookingDialogOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);

    if (selectedSlot) {
      setIsBookingDialogOpen(true);
      return;
    }

    navigate({ to: "/bookings", search: { parkingLocationId: id } });
  };

  if (isLoading) {
    return (
      <ParkingDetailsLayout isSignedIn={isSignedIn}>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ParkingDetailsLayout>
    );
  }

  if (!location) {
    return (
      <ParkingDetailsLayout isSignedIn={isSignedIn}>
        <div className="container mx-auto py-12 text-center text-muted-foreground">
          <p className="text-xl">Parking location not found.</p>
        </div>
      </ParkingDetailsLayout>
    );
  }

  return (
    <ParkingDetailsLayout isSignedIn={isSignedIn}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Details Section */}
          <div className="lg:col-span-5 space-y-6">
            {/* Photo Placeholder */}
            <div className="w-full aspect-square bg-muted rounded-2xl border-2 flex flex-col items-center justify-center text-muted-foreground overflow-hidden shadow-sm">
              <ImageIcon className="w-16 h-16 opacity-30 mb-4" />
              <span className="font-medium">Parking Place Photo</span>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
                  {location.name}
                </h1>

                <div className="space-y-4 mt-6">
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Location</p>
                      <p className="text-sm">{location.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start text-muted-foreground">
                    <div className="w-5 h-5 mr-3 mt-0.5 font-bold text-primary">
                      $
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Price</p>
                      <p className="text-sm">
                        Rs.{" "}
                        {location.fourWheelerRatePerHour ??
                          location.twoWheelerRatePerHour ??
                          0}{" "}
                        per hour
                      </p>
                    </div>
                  </div>

                  {location.distance && (
                    <div className="flex items-start text-muted-foreground">
                      <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          Distance
                        </p>
                        <p className="text-sm">
                          {location.distance.toFixed(1)} km from current place
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Secure and affordable parking space provided by{" "}
                      {location.vendorName}. Conveniently located with easy
                      access. Total of {availableSlots.length} slots available
                      right now.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slots Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-2xl border p-6 shadow-sm h-full">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Select a Slot
                <span className="text-sm font-normal py-1 px-3 bg-primary/10 text-primary rounded-full">
                  {availableSlots.length} available
                </span>
              </h2>

              {isSlotsLoading ? (
                <div className="flex min-h-64 items-center justify-center rounded-xl border bg-muted/20">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : slots.length > 0 ? (
                <SlotGrid
                  slots={slots}
                  selectedSlotId={selectedSlot?.id ?? null}
                  onSelectSlot={handleSlotSelect}
                />
              ) : (
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-200">
                  <p className="font-semibold text-lg">No Slots Found</p>
                  <p className="text-sm mt-1">
                    This parking location does not have slots configured yet.
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div>
                  {selectedSlot ? (
                    <p className="font-medium text-primary">
                      Selected: {selectedSlot.slotNumber}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Click an available slot to book
                    </p>
                  )}
                  {isSlotsFetching && !isSlotsLoading && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Refreshing slot statuses...
                    </p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="px-8"
                  onClick={() => {
                    if (isSignedIn) {
                      navigate({ to: "/bookings" });
                      return;
                    }
                    setIsLoginModalOpen(true);
                  }}
                >
                  {isSignedIn ? "My Bookings" : "Sign in to book"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onSuccess={handleLoginSuccess}
      />

      <DriverSlotBookingDialog
        open={isBookingDialogOpen}
        onOpenChange={(open) => {
          setIsBookingDialogOpen(open);
          if (!open) {
            setSelectedSlot(null);
          }
        }}
        parkingLocation={location}
        slot={selectedSlot}
      />
    </ParkingDetailsLayout>
  );
}

function ParkingDetailsLayout({
  children,
  isSignedIn,
}: {
  children: React.ReactNode;
  isSignedIn: boolean;
}) {
  if (isSignedIn) {
    return <AppLayout>{children}</AppLayout>;
  }

  return <PublicShell>{children}</PublicShell>;
}
