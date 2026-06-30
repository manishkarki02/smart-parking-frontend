import type {
  ParkingSlot,
  ParkingSlotStatus,
  ParkingSlotVehicleType,
} from "../types/parking.types";
import { cn } from "@/lib/utils";

interface SlotGridProps {
  slots: ParkingSlot[];
  selectedSlotId?: string | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
}

const statusLabels: Record<ParkingSlotStatus, string> = {
  AVAILABLE: "Free",
  RESERVED: "Reserved",
  BOOKED: "Booked",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

const vehicleTypeLabels: Record<ParkingSlotVehicleType, string> = {
  TWO_WHEELER: "Two Wheeler",
  FOUR_WHEELER: "Four Wheeler",
};

const statusClasses: Record<ParkingSlotStatus, string> = {
  AVAILABLE:
    "border-green-300 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60",
  RESERVED:
    "border-yellow-300 bg-yellow-100 text-yellow-800 opacity-75 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  BOOKED:
    "border-blue-300 bg-blue-100 text-blue-800 opacity-75 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  OCCUPIED:
    "border-red-300 bg-red-100 text-red-800 opacity-75 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300",
  MAINTENANCE:
    "border-slate-300 bg-slate-100 text-slate-700 opacity-75 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
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
        className={cn("size-4 rounded border", statusClasses[status])}
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
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {vehicleTypeLabels[vehicleType]}
        </h3>
        <span className="text-sm text-muted-foreground">
          {slots.filter((slot) => slot.status === "AVAILABLE").length} available
        </span>
      </div>

      {slots.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                  "relative flex h-20 items-center justify-center rounded-xl border-2 p-4 font-bold tracking-wider shadow-sm transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isAvailable ? "cursor-pointer" : "cursor-not-allowed",
                  statusClasses[slot.status],
                  isAvailable && "hover:-translate-y-0.5",
                  isSelected &&
                    "scale-105 border-primary bg-green-200 ring-2 ring-primary ring-offset-2 dark:bg-green-800",
                )}
              >
                <span>{slot.slotNumber}</span>
                <span className="sr-only">{statusLabels[slot.status]}</span>
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
      <div className="flex flex-wrap gap-4 rounded-lg bg-muted/30 p-4 text-sm font-medium">
        <LegendItem status="AVAILABLE" label="Free" />
        <LegendItem status="RESERVED" label="Reserved" />
        <LegendItem status="BOOKED" label="Booked" />
        <LegendItem status="OCCUPIED" label="Occupied" />
        <LegendItem status="MAINTENANCE" label="Maintenance" />
      </div>

      <div className="space-y-8 rounded-xl border bg-pink-50/50 p-5 dark:bg-slate-900/50">
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
