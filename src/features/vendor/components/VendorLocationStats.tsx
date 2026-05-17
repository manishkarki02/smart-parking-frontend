import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead className="text-center">Occupied</TableHead>
              <TableHead className="text-center">2-Wheeler (avail/occ)</TableHead>
              <TableHead className="text-center">4-Wheeler (avail/occ)</TableHead>
              <TableHead>Occupancy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">{loc.name}</TableCell>
                <TableCell className="text-center">{loc.totalSlots}</TableCell>
                <TableCell className="text-center text-green-600 font-medium">
                  {loc.availableSlots}
                </TableCell>
                <TableCell className="text-center text-red-500 font-medium">
                  {loc.occupiedSlots}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {loc.twoWheelerSlots.available} / {loc.twoWheelerSlots.occupied}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {loc.fourWheelerSlots.available} / {loc.fourWheelerSlots.occupied}
                </TableCell>
                <TableCell>
                  <OccupancyBar occupied={loc.occupiedSlots} total={loc.totalSlots} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {locations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>
    </>
  );
}
