import type {
  ParkingSlot,
  ParkingSlotStatus,
  ParkingSlotVehicleType,
} from "../types/parking.types";
import { cn } from "@/lib/utils";
import { Bike, Car } from "lucide-react";

interface SlotGridProps {
  slots: ParkingSlot[];
  selectedSlotId?: string | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
}

const statusLabels: Record<ParkingSlotStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  BOOKED: "Booked",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

const vehicleTypeLabels: Record<ParkingSlotVehicleType, string> = {
  TWO_WHEELER: "Two-Wheeler Slots",
  FOUR_WHEELER: "Four-Wheeler Slots",
};

const statusClasses: Record<ParkingSlotStatus, string> = {
  AVAILABLE:
    "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60",
  RESERVED:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  BOOKED:
    "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  OCCUPIED:
    "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  MAINTENANCE:
    "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
};

const statusDotClasses: Record<ParkingSlotStatus, string> = {
  AVAILABLE: "border-green-300 bg-green-100",
  RESERVED: "border-amber-300 bg-amber-100",
  BOOKED: "border-blue-300 bg-blue-100",
  OCCUPIED: "border-orange-300 bg-orange-100",
  MAINTENANCE: "border-slate-300 bg-slate-100",
};

function LegendItem({
  status,
  label,
}: {
  status: ParkingSlotStatus;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("size-3 rounded border", statusDotClasses[status])}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

function SlotGroup({
  vehicleType,
  slots,
  selectedSlotId,
  onSelectSlot,
}: {
  vehicleType: ParkingSlotVehicleType;
  slots: ParkingSlot[];
  selectedSlotId?: string | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
}) {
  const VehicleIcon = vehicleType === "TWO_WHEELER" ? Bike : Car;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <VehicleIcon className="size-4 shrink-0 text-slate-700" />
          <h3 className="truncate text-sm font-semibold text-slate-950">
            {vehicleTypeLabels[vehicleType]}
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {slots.filter((slot) => slot.status === "AVAILABLE").length} available
          of {slots.length}
        </span>
      </div>

      {slots.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(116px,1fr))] gap-3">
          {slots.map((slot) => {
            const isAvailable = slot.status === "AVAILABLE";
            const isSelected = selectedSlotId === slot.id;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  if (isAvailable) {
                    onSelectSlot?.(slot);
                  }
                }}
                title={`${slot.slotNumber} - ${vehicleTypeLabels[slot.vehicleType]} - ${statusLabels[slot.status]}`}
                className={cn(
                  "relative flex h-16 min-w-0 items-center justify-center rounded-lg border p-3 text-center shadow-sm transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-80",
                  statusClasses[slot.status],
                  isAvailable && "hover:-translate-y-0.5 hover:shadow-md",
                  isSelected &&
                    "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-950",
                )}
              >
                <span className="max-w-full truncate text-base font-bold">
                  {slot.slotNumber}
                </span>
                <span className="sr-only">
                  {isSelected ? "Selected" : statusLabels[slot.status]}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
          No {vehicleTypeLabels[vehicleType].toLowerCase()} slots found.
        </div>
      )}
    </section>
  );
}

export function SlotGrid({
  slots,
  selectedSlotId = null,
  onSelectSlot,
}: SlotGridProps) {
  const twoWheelerSlots = slots.filter(
    (slot) => slot.vehicleType === "TWO_WHEELER",
  );
  const fourWheelerSlots = slots.filter(
    (slot) => slot.vehicleType === "FOUR_WHEELER",
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
        <LegendItem status="AVAILABLE" label="Available" />
        <LegendItem status="RESERVED" label="Reserved" />
        <LegendItem status="BOOKED" label="Booked" />
        <LegendItem status="OCCUPIED" label="Occupied" />
        <LegendItem status="MAINTENANCE" label="Maintenance" />
      </div>

      <div className="space-y-7 rounded-lg bg-slate-100/70 p-4 dark:bg-slate-900/50">
        <SlotGroup
          vehicleType="TWO_WHEELER"
          slots={twoWheelerSlots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
        />
        <SlotGroup
          vehicleType="FOUR_WHEELER"
          slots={fourWheelerSlots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
        />
      </div>
    </div>
  );
}
