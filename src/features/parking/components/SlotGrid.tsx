import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "BOOKED";

interface MockSlot {
  id: number;
  number: string;
  status: SlotStatus;
}

interface SlotGridProps {
  availableCount: number;
  selectedSlot: number | null;
  onSelectSlot: (slotNum: number | null) => void;
}

export function SlotGrid({ availableCount, selectedSlot, onSelectSlot }: SlotGridProps) {
  // Generate a mock grid of slots
  const slots = useMemo(() => {
    const totalSlots = availableCount + 6; // Just to show some occupied/booked slots
    const generatedSlots: MockSlot[] = [];
    
    let assignedAvailable = 0;
    
    for (let i = 1; i <= totalSlots; i++) {
      let status: SlotStatus = "OCCUPIED";
      
      // Randomly assign available slots until we hit the count
      if (assignedAvailable < availableCount) {
        // High probability to be available if we need to fill them, to ensure we get to the count
        if (Math.random() > 0.3 || (totalSlots - i) <= (availableCount - assignedAvailable)) {
          status = "AVAILABLE";
          assignedAvailable++;
        } else {
           // If not available, maybe booked or occupied
           status = Math.random() > 0.5 ? "BOOKED" : "OCCUPIED";
        }
      } else {
        status = Math.random() > 0.5 ? "BOOKED" : "OCCUPIED";
      }

      generatedSlots.push({
        id: i,
        number: `A-${i.toString().padStart(2, '0')}`,
        status,
      });
    }
    return generatedSlots;
  }, [availableCount]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-6 text-sm font-medium p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-200 border border-green-400 dark:bg-green-900/50 dark:border-green-600"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-200 border border-red-400 dark:bg-red-900/50 dark:border-red-600"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-200 border border-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-600"></div>
          <span>Booked</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-pink-50/50 dark:bg-slate-900/50 p-6 rounded-xl border">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.id;
          const isAvailable = slot.status === "AVAILABLE";

          return (
            <button
              key={slot.id}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectSlot(isSelected ? null : slot.id)}
              className={cn(
                "relative flex items-center justify-center p-4 h-20 rounded-xl border-2 transition-all duration-300 shadow-sm",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                // Status colors matching wireframe requests
                slot.status === "AVAILABLE" && "bg-green-100 hover:bg-green-200 border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/60 cursor-pointer",
                slot.status === "OCCUPIED" && "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300 opacity-70 cursor-not-allowed",
                slot.status === "BOOKED" && "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-300 opacity-70 cursor-not-allowed",
                // Selected state
                isSelected && "ring-2 ring-primary ring-offset-2 scale-105 border-primary shadow-md bg-green-200 dark:bg-green-800"
              )}
            >
              <span className="font-bold tracking-wider">{slot.number}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
