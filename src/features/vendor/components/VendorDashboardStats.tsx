import { Building2, ParkingCircle, CheckCircle, XCircle } from "lucide-react";
import { StatsCard } from "@/features/admin/components/StatsCard";
import type { VendorDashboardData } from "../types/vendor.types";

interface VendorDashboardStatsProps {
  data: VendorDashboardData;
}

export function VendorDashboardStats({ data }: VendorDashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Parking Locations"
        value={data.totalParkingLocations}
        icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
      />
      <StatsCard
        title="Total Slots"
        value={data.totalSlots}
        icon={<ParkingCircle className="h-5 w-5 text-muted-foreground" />}
      />
      <StatsCard
        title="Available Slots"
        value={data.availableSlots}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
      <StatsCard
        title="Occupied Slots"
        value={data.occupiedSlots}
        icon={<XCircle className="h-5 w-5 text-red-500" />}
      />
    </div>
  );
}
