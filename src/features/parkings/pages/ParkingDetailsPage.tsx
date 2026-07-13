import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { DriverSlotBookingDialog } from "@/features/bookings/components/DriverSlotBookingDialog";
import {
  KpiGrid,
  MapPreviewCard,
  ParkingDetailHeader,
  ParkingDetailsLayout,
  ParkingDetailsSkeleton,
  ParkingLocationErrorState,
  ParkingOverviewCard,
  SlotSelectionCard,
} from "@/features/parkings/components/details/ParkingDetailsContent";
import {
  getParkingById,
  getParkingSlots,
} from "@/features/parkings/services/parking.service";
import type { ParkingSlot } from "@/features/parkings/types/parking.types";
import { queryKeys } from "@/config/query-keys";
import { useAuthStore } from "@/stores/auth-store";

interface ParkingDetailsPageProps {
  id: string;
}

const PARKING_DETAIL_REFRESH_INTERVAL_MS = 5000;

export function ParkingDetailsPage({ id }: ParkingDetailsPageProps) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const isSignedIn = Boolean(token);

  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const {
    data: location,
    isLoading: isLocationLoading,
    isError: isLocationError,
    refetch: refetchLocation,
  } = useQuery({
    queryKey: queryKeys.parking.detail(id),
    queryFn: () => getParkingById(id),
    refetchInterval: PARKING_DETAIL_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const {
    data: slots = [],
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
    isError: isSlotsError,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: queryKeys.parking.slots(id),
    queryFn: () => getParkingSlots(id),
    enabled: Boolean(location?.id),
    refetchInterval: PARKING_DETAIL_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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

  if (isLocationLoading) {
    return (
      <ParkingDetailsLayout isSignedIn={isSignedIn}>
        <ParkingDetailsSkeleton />
      </ParkingDetailsLayout>
    );
  }

  if (isLocationError || !location) {
    return (
      <ParkingDetailsLayout isSignedIn={isSignedIn}>
        <ParkingLocationErrorState
          onRetry={() => void refetchLocation()}
          onFindParking={() => navigate({ to: "/parkings/map" })}
        />
      </ParkingDetailsLayout>
    );
  }

  return (
    <ParkingDetailsLayout isSignedIn={isSignedIn}>
      {isSignedIn ? (
        <ParkingDetailHeader
          location={location}
          onFindParking={() => navigate({ to: "/parkings/map" })}
          inlineFallback={false}
        />
      ) : null}

      <div className="mx-auto w-full max-w-7xl space-y-4 px-0">
        <KpiGrid location={location} slots={slots} />

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <ParkingOverviewCard location={location} slots={slots} />
          <MapPreviewCard location={location} />
        </div>

        <SlotSelectionCard
          availableSlotsCount={availableSlots.length}
          isSlotsLoading={isSlotsLoading}
          isSlotsError={isSlotsError}
          isSlotsFetching={isSlotsFetching}
          slots={slots}
          selectedSlot={selectedSlot}
          isSignedIn={isSignedIn}
          onRetrySlots={() => void refetchSlots()}
          onSelectSlot={handleSlotSelect}
          onOpenBookings={() => navigate({ to: "/bookings" })}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
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
