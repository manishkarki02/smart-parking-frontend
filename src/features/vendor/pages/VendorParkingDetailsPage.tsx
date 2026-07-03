import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MoreVertical, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getParkingById,
  getVendorSlots,
} from "@/features/parkings/services/parking.service";
import type { ParkingSlot } from "@/features/parkings/types/parking.types";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { ParkingLocationForm } from "@/features/vendor/components/AddParkingForm";
import {
  ErrorState,
  ParkingDetailContent,
  ParkingDetailSkeleton,
} from "@/features/vendor/components/parking-details/VendorParkingDetailsContent";
import { VendorSlotActionDialog } from "@/features/vendor/components/VendorSlotActionDialog";

interface VendorParkingDetailsPageProps {
  parkingId: string;
}

export function VendorParkingDetailsPage({
  parkingId,
}: VendorParkingDetailsPageProps) {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const parkingQuery = useQuery({
    queryKey: queryKeys.parking.detail(parkingId),
    queryFn: () => getParkingById(parkingId),
  });

  const slotsQuery = useQuery({
    queryKey: queryKeys.parking.vendorSlots(parkingId),
    queryFn: () => getVendorSlots(parkingId),
  });

  const slots = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data]);
  const twoWheelerSlots = useMemo(
    () => slots.filter((slot) => slot.vehicleType === "TWO_WHEELER"),
    [slots],
  );
  const fourWheelerSlots = useMemo(
    () => slots.filter((slot) => slot.vehicleType === "FOUR_WHEELER"),
    [slots],
  );

  const location = parkingQuery.data;
  const isLoading = parkingQuery.isLoading || slotsQuery.isLoading;
  const isError = parkingQuery.isError || slotsQuery.isError;

  const pageAction = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="ghost" size="icon" aria-label="More actions">
        <MoreVertical className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEditOpen(true)}
        disabled={!location}
      >
        <Pencil className="size-4" />
        Edit Location
      </Button>
      <Button
        type="button"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setIsAddBookingOpen(true)}
      >
        <Plus className="size-4" />
        Add On-site Booking
      </Button>
    </div>
  );

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Overview"
        content={
          <h1 className="truncate text-base font-semibold text-slate-950">
            Overview
          </h1>
        }
        action={pageAction}
      />

      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5">
        {isLoading ? <ParkingDetailSkeleton /> : null}

        {isError ? (
          <ErrorState
            onRetry={() => {
              void parkingQuery.refetch();
              void slotsQuery.refetch();
            }}
            onBack={() => void navigate({ to: "/vendor/parkings" })}
          />
        ) : null}

        {!isLoading && !isError && !location ? (
          <ErrorState
            title="Unable to load parking details"
            message="Parking location not found."
            onRetry={() => void parkingQuery.refetch()}
            onBack={() => void navigate({ to: "/vendor/parkings" })}
          />
        ) : null}

        {!isLoading && !isError && location ? (
          <ParkingDetailContent
            location={location}
            slots={slots}
            twoWheelerSlots={twoWheelerSlots}
            fourWheelerSlots={fourWheelerSlots}
            selectedSlot={selectedSlot}
            onBack={() => void navigate({ to: "/vendor/parkings" })}
            onViewBookings={() => void navigate({ to: "/vendor/bookings" })}
            onAddBooking={() => setIsAddBookingOpen(true)}
            onSlotClick={setSelectedSlot}
          />
        ) : null}
      </div>

      {location ? (
        <>
          <AddOnSiteBookingDialog
            open={isAddBookingOpen}
            onOpenChange={setIsAddBookingOpen}
          />
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-190">
              <DialogHeader className="border-b px-6 py-5 sm:px-8">
                <DialogTitle className="text-2xl font-semibold">
                  Edit location
                </DialogTitle>
              </DialogHeader>
              <ParkingLocationForm
                mode="edit"
                initialValues={location}
                onCancel={() => setIsEditOpen(false)}
                onSuccess={() => setIsEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <VendorSlotActionDialog
            open={selectedSlot !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedSlot(null);
            }}
            slot={selectedSlot}
            parkingLocation={location}
          />
        </>
      ) : null}
    </div>
  );
}
