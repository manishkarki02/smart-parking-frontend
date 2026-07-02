import { useState, type ComponentType } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Car,
  CheckCircle2,
  CircleParking,
  Grid2X2,
  MapPin,
  Pencil,
  Plus,
  PlusCircle,
  ShieldCheck,
  ShieldQuestion,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { ParkingLocationForm } from "@/features/vendor/components/AddParkingForm";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { useVendorDashboard } from "../hooks/useVendorDashboard";
import type {
  VendorDashboardData,
  VendorDashboardLocation,
  VendorDashboardSlotStats,
} from "../types/vendor.types";

type Accent = "blue" | "purple" | "green" | "red" | "orange" | "amber";

const iconAccentStyles: Record<Accent, string> = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  amber: "bg-amber-50 text-amber-600",
};

function occupancyPercent(occupied: number, total: number) {
  return total > 0 ? Math.round((occupied / total) * 100) : 0;
}

function ratioPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function toParkingLocation(location: VendorDashboardLocation): ParkingLocation {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
    totalFourWheelerSlots: location.fourWheelerSlots.total,
    availableFourWheelerSlots: location.fourWheelerSlots.available,
    totalTwoWheelerSlots: location.twoWheelerSlots.total,
    availableTwoWheelerSlots: location.twoWheelerSlots.available,
    totalSlots: location.totalSlots,
    availableSlots: location.availableSlots,
    twoWheelerRatePerHour: location.twoWheelerRatePerHour,
    fourWheelerRatePerHour: location.fourWheelerRatePerHour,
    vendorName: location.vendorName ?? "",
  };
}

export function VendorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useVendorDashboard();
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<VendorDashboardLocation | null>(null);

  const vendorName = data?.vendor?.name ?? user?.name ?? "Vendor";
  const isApproved = data?.vendor?.approved ?? user?.approved ?? false;

  const headerAction = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <VendorApprovalBadge approved={isApproved} />
      <AddLocationDialog
        open={isAddLocationOpen}
        onOpenChange={setIsAddLocationOpen}
      />
    </div>
  );

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Vendor Dashboard"
        content={
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950">
              Vendor Dashboard
            </h1>
            <p className="truncate text-sm text-slate-500">
              Welcome back, {vendorName} — here's your parking overview
            </p>
          </div>
        }
        action={headerAction}
      />

      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5">
        {isError ? (
          <ErrorCard onRetry={() => void refetch()} />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : data ? (
          <>
            <DashboardKpis data={data} />

            <section className="min-w-0 space-y-3">
              <SectionHeading
                title="Vehicle Type Breakdown"
                subtitle="Slot usage by vehicle category"
              />
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                <VehicleBreakdownCard
                  title="Two Wheelers"
                  subtitle="Bikes & scooters"
                  stats={data.twoWheelerSlots}
                  icon={CircleParking}
                  accent="orange"
                />
                <VehicleBreakdownCard
                  title="Four Wheelers"
                  subtitle="Cars & SUVs"
                  stats={data.fourWheelerSlots}
                  icon={Car}
                  accent="blue"
                />
              </div>
            </section>

            <section className="min-w-0 space-y-3">
              <SectionHeading title="Quick Actions" />
              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <QuickActionCard
                  title="Manage Bookings"
                  subtitle="View & process bookings"
                  icon={CalendarClock}
                  accent="blue"
                  onClick={() => void navigate({ to: "/vendor/bookings" })}
                />
                <QuickActionCard
                  title="My Locations"
                  subtitle="Manage parking lots"
                  icon={MapPin}
                  accent="purple"
                  onClick={() => void navigate({ to: "/vendor/parkings" })}
                />
                <QuickActionCard
                  title="Walk-in Booking"
                  subtitle="Book slot for on-site driver"
                  icon={PlusCircle}
                  accent="green"
                  onClick={() => setIsWalkInOpen(true)}
                />
                <QuickActionCard
                  title="Slot Maintenance"
                  subtitle="Set slots under repair"
                  icon={Wrench}
                  accent="amber"
                  onClick={() =>
                    data.locations[0]
                      ? void navigate({
                          to: "/vendor/parking/$parkingId",
                          params: { parkingId: data.locations[0].id },
                        })
                      : void navigate({ to: "/vendor/parkings" })
                  }
                />
              </div>
            </section>

            <section className="min-w-0 space-y-3">
              <SectionHeading
                title="Location Summary"
                subtitle="Per-location slot status at a glance"
              />
              <LocationSummaryCard
                locations={data.locations}
                onAddLocation={() => setIsAddLocationOpen(true)}
                onViewAll={() => void navigate({ to: "/vendor/parkings" })}
                onViewLocation={(location) =>
                  void navigate({
                    to: "/vendor/parking/$parkingId",
                    params: { parkingId: location.id },
                  })
                }
                onEditLocation={setEditingLocation}
              />
            </section>
          </>
        ) : null}
      </div>

      <AddOnSiteBookingDialog open={isWalkInOpen} onOpenChange={setIsWalkInOpen} />

      <Dialog
        open={Boolean(editingLocation)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLocation(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-190">
          <DialogHeader className="border-b px-6 py-5 sm:px-8">
            <DialogTitle className="text-2xl font-semibold">
              Edit location
            </DialogTitle>
          </DialogHeader>
          {editingLocation ? (
            <ParkingLocationForm
              mode="edit"
              initialValues={toParkingLocation(editingLocation)}
              onCancel={() => setEditingLocation(null)}
              onSuccess={() => setEditingLocation(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorApprovalBadge({ approved }: { approved: boolean }) {
  return approved ? (
    <Badge className="gap-2 rounded-full border border-green-200 bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700 shadow-none hover:bg-green-100">
      <ShieldCheck className="size-4" />
      Approved Vendor
    </Badge>
  ) : (
    <Badge className="gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700 shadow-none hover:bg-amber-100">
      <ShieldQuestion className="size-4" />
      Pending Approval
    </Badge>
  );
}

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddLocationDialog({ open, onOpenChange }: AddLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="size-4" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-190">
        <DialogHeader className="border-b px-6 py-5 sm:px-8">
          <DialogTitle className="text-2xl font-semibold">
            Add location
          </DialogTitle>
        </DialogHeader>
        <ParkingLocationForm
          mode="create"
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function DashboardKpis({ data }: { data: VendorDashboardData }) {
  const availablePercent = ratioPercent(data.availableSlots, data.totalSlots);
  const occupiedPercent = ratioPercent(data.occupiedSlots, data.totalSlots);

  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="My Locations"
        value={data.totalParkingLocations}
        helper="Active parking lots"
        icon={MapPin}
        accent="blue"
      />
      <KpiCard
        label="Total Slots"
        value={data.totalSlots}
        helper="Across all locations"
        icon={CircleParking}
        accent="purple"
      />
      <KpiCard
        label="Available"
        value={data.availableSlots}
        badge={`${availablePercent}% free`}
        icon={CheckCircle2}
        accent="green"
        valueClassName="text-green-600"
      />
      <KpiCard
        label="Occupied"
        value={data.occupiedSlots}
        badge={`${occupiedPercent}% full`}
        icon={Car}
        accent="red"
        valueClassName="text-red-600"
      />
    </section>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent: Accent;
  helper?: string;
  badge?: string;
  valueClassName?: string;
}

function KpiCard({
  label,
  value,
  helper,
  badge,
  icon: Icon,
  accent,
  valueClassName,
}: KpiCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="flex min-h-28 justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p
            className={cn(
              "mt-5 text-3xl font-bold tracking-tight text-slate-950",
              valueClassName,
            )}
          >
            {value}
          </p>
          {badge ? (
            <Badge
              className={cn(
                "mt-3 rounded-full border-0 px-2.5 py-1 text-sm font-semibold shadow-none",
                accent === "green"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-red-100 text-red-600 hover:bg-red-100",
              )}
            >
              {badge}
            </Badge>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{helper}</p>
          )}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            iconAccentStyles[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

interface VehicleBreakdownCardProps {
  title: string;
  subtitle: string;
  stats: VendorDashboardSlotStats;
  icon: ComponentType<{ className?: string }>;
  accent: "orange" | "blue";
}

function VehicleBreakdownCard({
  title,
  subtitle,
  stats,
  icon: Icon,
  accent,
}: VehicleBreakdownCardProps) {
  const pct = occupancyPercent(stats.occupied, stats.total);
  const progressColor = accent === "orange" ? "bg-orange-500" : "bg-blue-600";
  const totalBadge =
    accent === "orange"
      ? "bg-orange-50 text-orange-600"
      : "bg-blue-50 text-blue-600";

  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                iconAccentStyles[accent],
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold text-slate-950">
                {title}
              </h3>
              <p className="truncate text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
          <Badge
            className={cn(
              "shrink-0 rounded-full border-0 px-3 py-1 text-sm font-semibold shadow-none",
              totalBadge,
            )}
          >
            {stats.total} slots
          </Badge>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
          <VehicleStatBlock label="Total" value={stats.total} tone="neutral" />
          <VehicleStatBlock
            label="Available"
            value={stats.available}
            tone="success"
          />
          <VehicleStatBlock
            label="Occupied"
            value={stats.occupied}
            tone="danger"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Occupancy</span>
            <span className="font-bold text-slate-950">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div
              className={cn("h-2.5 rounded-full transition-all", progressColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleStatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "danger";
}) {
  const styles = {
    neutral: "bg-slate-100 text-slate-950",
    success: "bg-green-50 text-green-600",
    danger: "bg-red-50 text-red-600",
  } satisfies Record<typeof tone, string>;

  return (
    <div className={cn("rounded-lg p-3", styles[tone])}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  accent: Accent;
  onClick: () => void;
}

function QuickActionCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      className="group flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-none transition hover:border-blue-200 hover:shadow-sm"
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          iconAccentStyles[accent],
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-slate-950">
          {title}
        </span>
        <span className="block truncate text-sm text-slate-500">
          {subtitle}
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-600" />
    </button>
  );
}

interface LocationSummaryCardProps {
  locations: VendorDashboardLocation[];
  onAddLocation: () => void;
  onViewAll: () => void;
  onViewLocation: (location: VendorDashboardLocation) => void;
  onEditLocation: (location: VendorDashboardLocation) => void;
}

function LocationSummaryCard({
  locations,
  onAddLocation,
  onViewAll,
  onViewLocation,
  onEditLocation,
}: LocationSummaryCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border-slate-200 bg-white shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-slate-950">All Locations</h3>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="outline" onClick={onViewAll}>
              <ArrowRight className="size-4 -rotate-45" />
              View All
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onAddLocation}
            >
              <Plus className="size-4" />
              Add Location
            </Button>
          </div>
        </div>

        {locations.length === 0 ? (
          <NoLocationsEmptyState onAddLocation={onAddLocation} />
        ) : (
          <Table className="table-fixed">
            <TableHeader className="bg-slate-100">
              <TableRow className="hover:bg-slate-100">
                {[
                  { label: "Location", className: "w-[18%]" },
                  { label: "Address", className: "w-[18%]" },
                  { label: "2W", className: "w-[10%]" },
                  { label: "4W", className: "w-[10%]" },
                  { label: "Total", className: "w-[9%]" },
                  { label: "Avail", className: "w-[9%]" },
                  { label: "Occ", className: "w-[9%]" },
                  { label: "Occupancy", className: "w-[12%]" },
                  { label: "Actions", className: "w-[9%]" },
                ].map((heading) => (
                  <TableHead
                    key={heading.label}
                    className={cn(
                      "h-10 px-3 text-xs font-bold uppercase tracking-wide text-slate-500",
                      heading.className,
                    )}
                  >
                    {heading.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <LocationSummaryRow
                  key={location.id}
                  location={location}
                  onViewLocation={onViewLocation}
                  onEditLocation={onEditLocation}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function LocationSummaryRow({
  location,
  onViewLocation,
  onEditLocation,
}: {
  location: VendorDashboardLocation;
  onViewLocation: (location: VendorDashboardLocation) => void;
  onEditLocation: (location: VendorDashboardLocation) => void;
}) {
  const pct = occupancyPercent(location.occupiedSlots, location.totalSlots);
  const progressColor =
    pct >= 70 ? "bg-red-500" : pct >= 45 ? "bg-amber-500" : "bg-orange-500";

  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="px-3 py-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{location.name}</p>
          <p className="truncate text-xs text-slate-500">
            {location.vendorName ?? "Vendor"}
          </p>
        </div>
      </TableCell>
      <TableCell className="truncate px-3 py-4 text-sm text-slate-500">
        {location.address}
      </TableCell>
      <TableCell className="px-3 py-4">
        <StackedSlotValue
          total={location.twoWheelerSlots.total}
          available={location.twoWheelerSlots.available}
        />
      </TableCell>
      <TableCell className="px-3 py-4">
        <StackedSlotValue
          total={location.fourWheelerSlots.total}
          available={location.fourWheelerSlots.available}
        />
      </TableCell>
      <TableCell className="px-3 py-4 font-semibold text-slate-950">
        {location.totalSlots}
      </TableCell>
      <TableCell className="px-3 py-4">
        <CountBadge value={location.availableSlots} tone="success" />
      </TableCell>
      <TableCell className="px-3 py-4">
        <CountBadge value={location.occupiedSlots} tone="danger" />
      </TableCell>
      <TableCell className="px-3 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-slate-100">
            <div
              className={cn("h-2 rounded-full", progressColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-500">
            {pct}%
          </span>
        </div>
      </TableCell>
      <TableCell className="px-3 py-4">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`View ${location.name}`}
            onClick={() => onViewLocation(location)}
          >
            <Grid2X2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${location.name}`}
            onClick={() => onEditLocation(location)}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function StackedSlotValue({
  total,
  available,
}: {
  total: number;
  available: number;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{total}</p>
      <p className="text-xs font-semibold text-green-600">{available} avail</p>
    </div>
  );
}

function CountBadge({
  value,
  tone,
}: {
  value: number;
  tone: "success" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
        tone === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600",
      )}
    >
      {value}
    </span>
  );
}

function NoLocationsEmptyState({
  onAddLocation,
}: {
  onAddLocation: () => void;
}) {
  return (
    <Empty className="m-4 min-h-64 border border-dashed border-slate-200 bg-white">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-slate-100 text-slate-600">
          <CircleParking className="size-6" />
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold text-slate-950">
          No parking locations yet
        </EmptyTitle>
        <EmptyDescription className="max-w-sm text-slate-500">
          Add your first parking location to start managing slots and bookings.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" onClick={onAddLocation}>
          <Plus className="size-4" />
          Add Location
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-red-100 bg-white shadow-none">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Unable to load dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">Please try again.</p>
        </div>
        <Button onClick={onRetry}>Retry</Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-slate-200 bg-white shadow-none">
            <CardContent className="space-y-5 p-5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 bg-slate-100" />
                <Skeleton className="size-10 bg-slate-100" />
              </div>
              <Skeleton className="h-8 w-14 bg-slate-100" />
              <Skeleton className="h-4 w-32 bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="border-slate-200 bg-white shadow-none">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="size-10 bg-slate-100" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36 bg-slate-100" />
                  <Skeleton className="h-4 w-24 bg-slate-100" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-20 bg-slate-100" />
                <Skeleton className="h-20 bg-slate-100" />
                <Skeleton className="h-20 bg-slate-100" />
              </div>
              <Skeleton className="h-3 w-full bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white shadow-none">
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-slate-100" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
