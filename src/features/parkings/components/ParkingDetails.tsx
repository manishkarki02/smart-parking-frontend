import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { useAuthStore } from "@/stores/auth-store";
import useParkingSlots from "@/features/parkings/hooks/useParkingSlots";
import { DriverSlotBookingDialog } from "@/features/bookings/components/DriverSlotBookingDialog";
import { queryKeys } from "@/config/query-keys";
import { getParkingSlots } from "../services/parking.service";
import type { ParkingSlot } from "../types/parking.types";
import { SlotGrid } from "./SlotGrid";

type ParkingDetailsProps = {
  parkingId: string;
};

export function ParkingDetails({ parkingId }: ParkingDetailsProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { locations, isLoading } = useParkingSlots();

  const location = useMemo(() => {
    return locations?.find((loc) => loc.id === parkingId);
  }, [locations, parkingId]);

  const { data: slots = [], isLoading: isSlotsLoading } = useQuery({
    queryKey: queryKeys.parking.slots(parkingId),
    queryFn: () => getParkingSlots(parkingId),
    enabled: Boolean(location),
  });

  const availableSlots = slots.filter((slot) => slot.status === "AVAILABLE");

  const handleSlotSelect = (slot: ParkingSlot) => {
    if (slot.status !== "AVAILABLE") {
      toast.error("Only available slots can be booked.");
      return;
    }

    setSelectedSlot(slot);
    if (!isAuthenticated()) {
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

    navigate({
      to: "/bookings",
      search: { parkingLocationId: location?.id },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground">
        <p className="text-xl">Parking location not found.</p>
      </div>
    );
  }

  const signedIn = isAuthenticated();

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 bg-muted text-muted-foreground shadow-sm">
              <ImageIcon className="mb-4 h-16 w-16 opacity-30" />
              <span className="font-medium">Parking Place Photo</span>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
                  {location.name}
                </h1>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="mr-3 mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Location</p>
                      <p className="text-sm">{location.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start text-muted-foreground">
                    <div className="mr-3 mt-0.5 h-5 w-5 font-bold text-primary">
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
                      <MapPin className="mr-3 mt-0.5 h-5 w-5 text-primary" />
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

                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm leading-relaxed text-foreground/80">
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

          <div className="space-y-6 lg:col-span-7">
            <div className="h-full rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
                Select a Slot
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-normal text-primary">
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
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                  <p className="text-lg font-semibold">No Slots Found</p>
                  <p className="mt-1 text-sm">
                    This parking location does not have slots configured yet.
                  </p>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <div>
                  {selectedSlot ? (
                    <p className="font-medium text-primary">
                      Selected: {selectedSlot.slotNumber}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click an available slot to book
                    </p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="px-8"
                  onClick={() => {
                    if (signedIn) {
                      navigate({ to: "/bookings" });
                      return;
                    }
                    setIsLoginModalOpen(true);
                  }}
                >
                  {signedIn ? "My Bookings" : "Sign in to book"}
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
    </>
  );
}
