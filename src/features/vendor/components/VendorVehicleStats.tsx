import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorDashboardData, VendorDashboardSlotStats } from "../types/vendor.types";

function occupancyPct(occupied: number, total: number) {
  if (!total) return 0;
  return Math.round((occupied / total) * 100);
}

function SlotBreakdown({ stats }: { stats: VendorDashboardSlotStats }) {
  const pct = occupancyPct(stats.occupied, stats.total);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold">{stats.total}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-green-600">Available</span>
        <span className="font-semibold text-green-600">{stats.available}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-red-500">Occupied</span>
        <span className="font-semibold text-red-500">{stats.occupied}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Occupancy</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface VendorVehicleStatsProps {
  data: VendorDashboardData;
}

export function VendorVehicleStats({ data }: VendorVehicleStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-Wheeler Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <SlotBreakdown stats={data.twoWheelerSlots} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Four-Wheeler Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <SlotBreakdown stats={data.fourWheelerSlots} />
        </CardContent>
      </Card>
    </div>
  );
}
