import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle2,
  CreditCard,
  Grid2X2,
  Image as ImageIcon,
  MapPin,
  MoreVertical,
  Navigation,
  Pencil,
  Plus,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { queryKeys } from "@/config/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getParkingById,
  getVendorSlots,
} from "@/features/parkings/services/parking.service";
import type {
  ParkingLocation,
  ParkingSlot,
  ParkingSlotStatus,
  ParkingSlotVehicleType,
} from "@/features/parkings/types/parking.types";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { ParkingLocationForm } from "@/features/vendor/components/AddParkingForm";
import { VendorSlotActionDialog } from "@/features/vendor/components/VendorSlotActionDialog";
import { cn } from "@/lib/utils";

const statusLabels: Record<ParkingSlotStatus, string> = {
  AVAILABLE: "Free",
  RESERVED: "Reserved",
  BOOKED: "Booked",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

const slotCardClasses: Record<ParkingSlotStatus, string> = {
  AVAILABLE:
    "border-green-500 bg-green-50 text-green-800 hover:bg-green-100",
  RESERVED:
    "border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100",
  BOOKED: "border-blue-500 bg-blue-50 text-blue-800 hover:bg-blue-100",
  OCCUPIED: "border-red-500 bg-red-50 text-red-700 hover:bg-red-100",
  MAINTENANCE:
    "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200",
};

const legendClasses: Record<ParkingSlotStatus, string> = {
  AVAILABLE: "border-green-500 bg-green-100",
  RESERVED: "border-amber-500 bg-amber-100",
  BOOKED: "border-blue-500 bg-blue-100",
  OCCUPIED: "border-red-500 bg-red-100",
  MAINTENANCE: "border-slate-300 bg-slate-200",
};

interface VendorParkingDetailsPageProps {
  parkingId: string;
}

interface SlotCounts {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  booked: number;
  maintenance: number;
  twoWheelerTotal: number;
  fourWheelerTotal: number;
}

function getSlotCounts(slots: ParkingSlot[], location: ParkingLocation): SlotCounts {
  const countStatus = (status: ParkingSlotStatus) =>
    slots.filter((slot) => slot.status === status).length;

  const twoWheelerTotal =
    slots.filter((slot) => slot.vehicleType === "TWO_WHEELER").length ||
    location.totalTwoWheelerSlots ||
    0;
  const fourWheelerTotal =
    slots.filter((slot) => slot.vehicleType === "FOUR_WHEELER").length ||
    location.totalFourWheelerSlots ||
    0;

  return {
    total: slots.length || location.totalSlots || 0,
    available: countStatus("AVAILABLE") || location.availableSlots || 0,
    occupied: countStatus("OCCUPIED"),
    reserved: countStatus("RESERVED"),
    booked: countStatus("BOOKED"),
    maintenance: countStatus("MAINTENANCE"),
    twoWheelerTotal,
    fourWheelerTotal,
  };
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

function ParkingDetailContent({
  location,
  slots,
  twoWheelerSlots,
  fourWheelerSlots,
  selectedSlot,
  onBack,
  onViewBookings,
  onAddBooking,
  onSlotClick,
}: {
  location: ParkingLocation;
  slots: ParkingSlot[];
  twoWheelerSlots: ParkingSlot[];
  fourWheelerSlots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onBack: () => void;
  onViewBookings: () => void;
  onAddBooking: () => void;
  onSlotClick: (slot: ParkingSlot) => void;
}) {
  const counts = getSlotCounts(slots, location);

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back to locations
        </button>
        <span className="text-slate-300">/</span>
        <span className="min-w-0 truncate text-slate-500">{location.name}</span>
      </div>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,1fr)]">
        <ParkingImageCard location={location} />
        <ParkingInfoCard
          location={location}
          availableCount={counts.available}
          totalCount={counts.total}
          onAddBooking={onAddBooking}
          onViewBookings={onViewBookings}
        />
      </section>

      <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Slots"
          value={counts.total}
          icon={Grid2X2}
          accent="blue"
        />
        <StatCard
          label="Available"
          value={counts.available}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="Occupied"
          value={counts.occupied}
          icon={Car}
          accent="red"
        />
        <StatCard
          label="Two-Wheeler Slots"
          value={counts.twoWheelerTotal}
          icon={Bike}
          accent="purple"
        />
        <StatCard
          label="Four-Wheeler Slots"
          value={counts.fourWheelerTotal}
          icon={Car}
          accent="blue"
        />
      </section>

      <SlotsSection
        availableCount={counts.available}
        totalCount={counts.total}
        twoWheelerSlots={twoWheelerSlots}
        fourWheelerSlots={fourWheelerSlots}
        selectedSlot={selectedSlot}
        onSlotClick={onSlotClick}
      />
    </>
  );
}

function ParkingImageCard({ location }: { location: ParkingLocation }) {
  return (
    <div className="min-h-72 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      {location.imageUrl ? (
        <img
          src={location.imageUrl}
          alt={location.name}
          className="h-full max-h-96 min-h-72 w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-72 flex-col items-center justify-center text-slate-500">
          <ImageIcon className="mb-3 size-12 opacity-50" />
          <span className="text-sm font-medium">Parking preview</span>
        </div>
      )}
    </div>
  );
}

function ParkingInfoCard({
  location,
  availableCount,
  totalCount,
  onAddBooking,
  onViewBookings,
}: {
  location: ParkingLocation;
  availableCount: number;
  totalCount: number;
  onAddBooking: () => void;
  onViewBookings: () => void;
}) {
  return (
    <Card className="min-w-0 border-slate-200 bg-white shadow-none">
      <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
        <div className="min-w-0 space-y-5">
          <div>
            <h2 className="truncate text-2xl font-bold text-slate-950">
              {location.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              <span className="font-semibold text-green-600">{availableCount}</span>{" "}
              of {totalCount} slots available
            </p>
          </div>

          <div className="space-y-4">
            <DetailRow
              icon={<MapPin className="size-4 text-blue-600" />}
              label="Location"
              value={location.address}
            />
            <DetailRow
              icon={<CreditCard className="size-4 text-blue-600" />}
              label="Rates"
              value={[
                location.fourWheelerRatePerHour
                  ? `4W Rs ${location.fourWheelerRatePerHour}/hr`
                  : null,
                location.twoWheelerRatePerHour
                  ? `2W Rs ${location.twoWheelerRatePerHour}/hr`
                  : null,
              ]
                .filter(Boolean)
                .join(" | ")}
            />
            <DetailRow
              icon={<Navigation className="size-4 text-blue-600" />}
              label="Coordinates"
              value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
            />
            <DetailRow
              icon={<Wallet className="size-4 text-blue-600" />}
              label="Managed by"
              value={location.vendorName || "Vendor"}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAddBooking}>
            <Plus className="size-4" />
            Add On-site Booking
          </Button>
          <Button variant="outline" onClick={onViewBookings}>
            View Bookings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <p className="mt-0.5 break-words text-sm leading-5 text-slate-500">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

type StatAccent = "blue" | "green" | "red" | "purple";

const statAccentClasses: Record<StatAccent, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent: StatAccent;
}) {
  return (
    <Card className="min-w-0 border-slate-200 bg-white shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            statAccentClasses[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SlotsSection({
  availableCount,
  totalCount,
  twoWheelerSlots,
  fourWheelerSlots,
  selectedSlot,
  onSlotClick,
}: {
  availableCount: number;
  totalCount: number;
  twoWheelerSlots: ParkingSlot[];
  fourWheelerSlots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSlotClick: (slot: ParkingSlot) => void;
}) {
  const hasSlots = twoWheelerSlots.length + fourWheelerSlots.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-950">Slots</h2>
            <p className="mt-1 text-sm text-slate-500">
              View all slots grouped by vehicle type
            </p>
          </div>
          <Badge className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50">
            {availableCount} available
          </Badge>
        </div>

        <SlotLegend />

        {hasSlots ? (
          <div className="space-y-5 rounded-xl bg-slate-100/70 p-4">
            <SlotGroup
              title="Two Wheeler"
              vehicleType="TWO_WHEELER"
              slots={twoWheelerSlots}
              selectedSlot={selectedSlot}
              onSlotClick={onSlotClick}
            />
            <SlotGroup
              title="Four Wheeler"
              vehicleType="FOUR_WHEELER"
              slots={fourWheelerSlots}
              selectedSlot={selectedSlot}
              onSlotClick={onSlotClick}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-950">No slots found</p>
            <p className="mt-1 text-sm text-slate-500">
              This parking location does not have any slots yet.
            </p>
          </div>
        )}

        {totalCount === 0 ? null : (
          <p className="sr-only">{totalCount} total parking slots</p>
        )}
      </CardContent>
    </Card>
  );
}

function SlotLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {(["AVAILABLE", "RESERVED", "BOOKED", "OCCUPIED", "MAINTENANCE"] as const).map(
        (status) => (
          <div key={status} className="flex items-center gap-2">
            <span className={cn("size-3 rounded border", legendClasses[status])} />
            <span className="text-slate-700">{statusLabels[status]}</span>
          </div>
        ),
      )}
    </div>
  );
}

function SlotGroup({
  title,
  vehicleType,
  slots,
  selectedSlot,
  onSlotClick,
}: {
  title: string;
  vehicleType: ParkingSlotVehicleType;
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSlotClick: (slot: ParkingSlot) => void;
}) {
  const VehicleIcon = vehicleType === "TWO_WHEELER" ? Bike : Car;

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-center gap-2">
        <VehicleIcon className="size-4 text-slate-600" />
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <span className="text-sm text-slate-500">{slots.length} slots</span>
      </div>

      {slots.length > 0 ? (
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
          {slots.map((slot) => (
            <SlotButton
              key={slot.id}
              slot={slot}
              selected={selectedSlot?.id === slot.id}
              onClick={() => onSlotClick(slot)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-white/70 p-5 text-sm text-slate-500">
          No {title.toLowerCase()} slots found.
        </div>
      )}
    </section>
  );
}

function SlotButton({
  slot,
  selected,
  onClick,
}: {
  slot: ParkingSlot;
  selected: boolean;
  onClick: () => void;
}) {
  const VehicleIcon = slot.vehicleType === "TWO_WHEELER" ? Bike : Car;

  return (
    <button
      type="button"
      className={cn(
        "flex h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        slotCardClasses[slot.status],
        selected && "border-blue-500 ring-2 ring-blue-300",
      )}
      title={`${slot.slotNumber} - ${statusLabels[slot.status]}`}
      onClick={onClick}
    >
      <VehicleIcon className="size-4" />
      <span className="truncate">{slot.slotNumber}</span>
    </button>
  );
}

function ErrorState({
  title = "Unable to load parking details",
  message = "Please try again.",
  onRetry,
  onBack,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="border-red-100 bg-white shadow-none">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to locations
          </Button>
          <Button onClick={onRetry}>Retry</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ParkingDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-52 bg-slate-100" />
      <section className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl bg-slate-100" />
        <Skeleton className="h-72 rounded-xl bg-slate-100" />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl bg-slate-100" />
        ))}
      </section>
      <Skeleton className="h-72 rounded-xl bg-slate-100" />
    </div>
  );
}
