import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Car,
  Image as ImageIcon,
  MapPin,
  Wallet,
} from "lucide-react";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { queryKeys } from "@/config/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getParkingById,
  getVendorSlots,
} from "@/features/parkings/services/parking.service";
import type {
  ParkingSlot,
  ParkingSlotStatus,
} from "@/features/parkings/types/parking.types";
import { VendorSlotActionDialog } from "@/features/vendor/components/VendorSlotActionDialog";
import { cn } from "@/lib/utils";

const statusLabels: Record<ParkingSlotStatus, string> = {
  AVAILABLE: "Free",
  RESERVED: "Reserved",
  BOOKED: "Booked",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

const statusClasses: Record<ParkingSlotStatus, string> = {
  AVAILABLE:
    "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-emerald-100",
  RESERVED: "border-yellow-300 bg-yellow-100 text-yellow-800 shadow-yellow-100",
  BOOKED: "border-blue-300 bg-blue-100 text-blue-800 shadow-blue-100",
  OCCUPIED: "border-red-200 bg-red-100 text-red-700 shadow-red-100",
  MAINTENANCE: "border-slate-300 bg-slate-100 text-slate-700 shadow-slate-100",
};

interface VendorParkingDetailsPageProps {
  parkingId: string;
}

export function VendorParkingDetailsPage({
  parkingId,
}: VendorParkingDetailsPageProps) {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const parkingQuery = useQuery({
    queryKey: queryKeys.parking.detail(parkingId),
    queryFn: () => getParkingById(parkingId),
    enabled: isAuthorized,
  });

  const slotsQuery = useQuery({
    queryKey: queryKeys.parking.vendorSlots(parkingId),
    queryFn: () => getVendorSlots(parkingId),
    enabled: isAuthorized,
  });

  const slots = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data]);
  const availableCount = useMemo(
    () => slots.filter((slot) => slot.status === "AVAILABLE").length,
    [slots],
  );
  const twoWheelerSlots = useMemo(
    () => slots.filter((slot) => slot.vehicleType === "TWO_WHEELER"),
    [slots],
  );
  const fourWheelerSlots = useMemo(
    () => slots.filter((slot) => slot.vehicleType === "FOUR_WHEELER"),
    [slots],
  );

  if (!isAuthorized) {
    return null;
  }

  if (parkingQuery.isLoading || slotsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!parkingQuery.data) {
    return (
      <div className="space-y-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: "/vendor/parkings" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to locations
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Parking location not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const location = parkingQuery.data;
  const fourWheelerRate = location.fourWheelerRatePerHour;
  const twoWheelerRate = location.twoWheelerRatePerHour;

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate({ to: "/vendor/parkings" })}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to locations
      </Button>

      <div className="space-y-6 rounded-3xl border border-dashed border-slate-300 bg-background p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex min-h-85 flex-col items-center justify-center rounded-3xl border bg-muted/30 text-muted-foreground shadow-sm">
            <ImageIcon className="mb-4 size-16 opacity-35" />
            <span className="font-semibold">Parking Place Photo</span>
          </div>

          <Card className="min-h-85 rounded-3xl">
            <CardContent className="flex h-full flex-col justify-center space-y-6 p-6 sm:p-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  {location.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {availableCount} of {slots.length} slots available
                </p>
              </div>

              <DetailRow
                icon={<MapPin className="size-5 text-blue-600" />}
                label="Location"
                value={location.address}
              />

              <DetailRow
                icon={<Wallet className="size-5 text-blue-600" />}
                label="Rates"
                value={[
                  fourWheelerRate ? `4W Rs ${fourWheelerRate}/hr` : null,
                  twoWheelerRate ? `2W Rs ${twoWheelerRate}/hr` : null,
                ]
                  .filter(Boolean)
                  .join(" | ")}
              />

              <DetailRow
                icon={<Car className="size-5 text-blue-600" />}
                label="Coordinates"
                value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Slots</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review all slots grouped by vehicle type.
                </p>
              </div>
              <Badge className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                {availableCount} available
              </Badge>
            </div>

            <SlotLegend />

            <div className="space-y-8 rounded-2xl border bg-sky-50/40 p-5 sm:p-6">
              <SlotGroup
                title="Two Wheeler"
                slots={twoWheelerSlots}
                onSlotClick={setSelectedSlot}
              />
              <SlotGroup
                title="Four Wheeler"
                slots={fourWheelerSlots}
                onSlotClick={setSelectedSlot}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <VendorSlotActionDialog
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSlot(null);
          }
        }}
        slot={selectedSlot}
        parkingLocation={location}
      />
    </div>
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
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="font-bold text-foreground">{label}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

function SlotLegend() {
  return (
    <div className="flex flex-wrap gap-5 rounded-2xl bg-muted/20 p-4 text-sm font-semibold">
      <LegendItem className="border-emerald-400 bg-emerald-100" label="Free" />
      <LegendItem
        className="border-yellow-400 bg-yellow-100"
        label="Reserved"
      />
      <LegendItem className="border-blue-400 bg-blue-100" label="Booked" />
      <LegendItem className="border-red-300 bg-red-100" label="Occupied" />
      <LegendItem
        className="border-slate-300 bg-slate-100"
        label="Maintenance"
      />
    </div>
  );
}

function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("size-4 rounded border", className)} />
      <span>{label}</span>
    </div>
  );
}

function VendorSlotGrid({
  slots,
  onSlotClick,
}: {
  slots: ParkingSlot[];
  onSlotClick: (slot: ParkingSlot) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {slots.map((slot) => (
        <button
          type="button"
          key={slot.id}
          className={cn(
            "flex h-20 items-center justify-center rounded-xl border-2 text-base font-black shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            statusClasses[slot.status],
          )}
          title={`${slot.slotNumber} - ${slot.vehicleType} - ${statusLabels[slot.status]}`}
          onClick={() => onSlotClick(slot)}
        >
          {slot.slotNumber}
        </button>
      ))}
    </div>
  );
}

function SlotGroup({
  title,
  slots,
  onSlotClick,
}: {
  title: string;
  slots: ParkingSlot[];
  onSlotClick: (slot: ParkingSlot) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-black">{title}</h3>
        <span className="text-sm font-medium text-muted-foreground">
          {slots.length} slots
        </span>
      </div>

      {slots.length > 0 ? (
        <VendorSlotGrid slots={slots} onSlotClick={onSlotClick} />
      ) : (
        <div className="rounded-xl border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
          No {title.toLowerCase()} slots found.
        </div>
      )}
    </section>
  );
}
