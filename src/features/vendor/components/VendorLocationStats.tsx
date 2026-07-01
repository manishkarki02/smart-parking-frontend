import { useState } from "react";
import { SplitDataTable, SplitDetailPanel, type DataTableColumn } from "@/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorDashboardLocation } from "../types/vendor.types";

function occupancyPct(occupied: number, total: number) {
  if (!total) return 0;
  return Math.round((occupied / total) * 100);
}

function OccupancyBar({ occupied, total }: { occupied: number; total: number }) {
  const pct = occupancyPct(occupied, total);
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div
          className="bg-primary rounded-full h-1.5 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

function LocationCard({ location }: { location: VendorDashboardLocation }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{location.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total / Available / Occupied</span>
          <span className="font-medium">
            {location.totalSlots} / {location.availableSlots} / {location.occupiedSlots}
          </span>
        </div>
        <OccupancyBar occupied={location.occupiedSlots} total={location.totalSlots} />

        <div className="pt-1 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Two-Wheeler</span>
            <span>
              {location.twoWheelerSlots.available} avail / {location.twoWheelerSlots.occupied} occ
            </span>
          </div>
          <div className="flex justify-between">
            <span>Four-Wheeler</span>
            <span>
              {location.fourWheelerSlots.available} avail / {location.fourWheelerSlots.occupied} occ
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface VendorLocationStatsProps {
  locations: VendorDashboardLocation[];
}

export function VendorLocationStats({ locations }: VendorLocationStatsProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null;

  const columns: DataTableColumn<VendorDashboardLocation>[] = [
    {
      id: "location",
      header: "Location",
      cell: (location) => location.name,
      className: "font-medium",
      compact: true,
    },
    {
      id: "total",
      header: "Total",
      align: "center",
      cell: (location) => location.totalSlots,
    },
    {
      id: "available",
      header: "Available",
      align: "center",
      className: "font-medium text-green-600",
      cell: (location) => location.availableSlots,
      compact: true,
    },
    {
      id: "occupied",
      header: "Occupied",
      align: "center",
      className: "font-medium text-red-500",
      cell: (location) => location.occupiedSlots,
      compact: true,
    },
    {
      id: "twoWheeler",
      header: "2-Wheeler (avail/occ)",
      align: "center",
      className: "text-muted-foreground",
      cell: (location) =>
        `${location.twoWheelerSlots.available} / ${location.twoWheelerSlots.occupied}`,
    },
    {
      id: "fourWheeler",
      header: "4-Wheeler (avail/occ)",
      align: "center",
      className: "text-muted-foreground",
      cell: (location) =>
        `${location.fourWheelerSlots.available} / ${location.fourWheelerSlots.occupied}`,
    },
    {
      id: "occupancy",
      header: "Occupancy",
      cell: (location) => (
        <OccupancyBar
          occupied={location.occupiedSlots}
          total={location.totalSlots}
        />
      ),
      compact: true,
    },
  ];

  const compactColumns = columns.filter((column) =>
    ["location", "available", "occupied", "occupancy"].includes(column.id),
  );

  return (
    <>
      <div className="hidden md:block">
        <SplitDataTable
          rows={locations}
          columns={columns}
          compactColumns={compactColumns}
          getRowId={(location) => location.id}
          selectedRowId={selectedLocationId}
          onRowSelect={(location) =>
            setSelectedLocationId((current) =>
              current === location.id ? null : location.id,
            )
          }
          onDetailClose={() => setSelectedLocationId(null)}
          detailTitle={selectedLocation?.name ?? "Location details"}
          detailPanel={
            selectedLocation ? (
              <SplitDetailPanel
                title={selectedLocation.name}
                subtitle="Parking location stats"
                onClose={() => setSelectedLocationId(null)}
              >
                <LocationCard location={selectedLocation} />
              </SplitDetailPanel>
            ) : null
          }
        />
      </div>

      <div className="grid gap-3 md:hidden">
        {locations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>
    </>
  );
}
