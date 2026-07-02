import { useMemo, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyParkingLocations } from "@/features/vendor/services/vendor.service";
import { VendorParkingCard } from "@/features/vendor/components/VendorParkingCard";
import { ParkingLocationForm } from "@/features/vendor/components/AddParkingForm";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  CircleParking,
  CircleX,
  Filter,
  Map,
  Plus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/common/components/PageHeader";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import useDebounce from "@/common/hooks/useDebounce";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { cn } from "@/lib/utils";

interface LocationMetrics {
  totalLocations: number;
  availableSlots: number;
  occupancyRate: number;
  underReview: number;
}

function getTotalSlots(location: ParkingLocation) {
  return (
    location.totalSlots ??
    (location.totalTwoWheelerSlots ?? 0) + (location.totalFourWheelerSlots ?? 0)
  );
}

function getLocationMetrics(locations: ParkingLocation[]): LocationMetrics {
  const availableSlots = locations.reduce(
    (sum, location) => sum + location.availableSlots,
    0,
  );
  const totalSlots = locations.reduce(
    (sum, location) => sum + getTotalSlots(location),
    0,
  );
  const occupiedSlots = Math.max(totalSlots - availableSlots, 0);

  return {
    totalLocations: locations.length,
    availableSlots,
    occupancyRate:
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
    underReview: 0,
  };
}

function filterLocations(locations: ParkingLocation[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return locations;
  }

  return locations.filter((location) =>
    [location.name, location.address, location.vendorName]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch)),
  );
}

export function VendorParkingPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeOnly, setActiveOnly] = useState(true);

  const {
    data: locations = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
    enabled: isAuthorized,
  });

  const metrics = useMemo(() => getLocationMetrics(locations), [locations]);
  const filteredLocations = useMemo(
    () => filterLocations(locations, debouncedSearchTerm),
    [locations, debouncedSearchTerm],
  );
  const hasSearch = searchTerm.trim().length > 0;
  const hasLocations = locations.length > 0;

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Parking Locations"
        content={
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950">
              My Parking Locations
            </h1>
            <p className="truncate text-sm text-slate-500">
              Manage parking lots, availability, and location details
            </p>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="size-4" />
              Filter
            </Button>
            <AddLocationDialog
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
            />
          </div>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-6 overflow-x-hidden">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Locations"
            value={metrics.totalLocations.toString()}
            helper="Active parking locations"
            icon={Building2}
            accent="blue"
          />
          <MetricCard
            label="Available Slots"
            value={metrics.availableSlots.toString()}
            helper="Across all listed parkings"
            icon={CheckCircle2}
            accent="green"
          />
          <MetricCard
            label="Occupancy Rate"
            value={`${metrics.occupancyRate}%`}
            helper="Average utilization today"
            icon={BarChart3}
            accent="amber"
          />
          <MetricCard
            label="Under Review"
            value={metrics.underReview.toString()}
            helper="Draft or recently edited location"
            icon={Map}
            accent="slate"
          />
        </section>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by parking name, address, or city..."
                  className="h-10 border-slate-200 pl-9 text-sm shadow-none"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className={cn(
                  "h-9 w-fit rounded-full px-4 text-xs font-medium shadow-none",
                  activeOnly
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-white text-slate-500 hover:bg-slate-50",
                )}
                onClick={() => setActiveOnly((value) => !value)}
                aria-pressed={activeOnly}
              >
                <CheckCircle2 className="size-3.5" />
                Active only
              </Button>
            </div>
            <p className="text-sm text-slate-500">
              {filteredLocations.length} locations found
            </p>
          </CardContent>
        </Card>

        {isError ? (
          <Card className="border-red-100 bg-white shadow-none">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Unable to load parking locations
                </h2>
                <p className="mt-1 text-sm text-slate-500">Please try again.</p>
              </div>
              <Button onClick={() => void refetch()}>Retry</Button>
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                All Locations
              </h2>
              <p className="text-sm text-slate-500">
                View, edit, or open a parking location
              </p>
            </div>
            <LoadingStateSection />
          </section>
        ) : !isError ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                All Locations
              </h2>
              <p className="text-sm text-slate-500">
                View, edit, or open a parking location
              </p>
            </div>

            {filteredLocations.length === 0 ? (
              hasLocations || hasSearch ? (
                <NoMatchingLocations
                  onClearFilters={() => {
                    setSearchTerm("");
                    setActiveOnly(true);
                  }}
                />
              ) : (
                <ParkingEmptyState
                  onAddLocation={() => setIsAddModalOpen(true)}
                />
              )
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredLocations.map((location) => (
                  <VendorParkingCard key={location.id} location={location} />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
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
        <Button>
          <Plus className="size-4" />
          Add New Location
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

type MetricAccent = "blue" | "green" | "amber" | "slate";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  accent: MetricAccent;
}

const metricAccentStyles: Record<MetricAccent, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
};

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: MetricCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="flex min-h-28 justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            metricAccentStyles[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function LoadingStateSection() {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-32 bg-slate-100" />
          <p className="text-xs text-slate-500">Skeleton cards</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="min-h-40 border-slate-200 bg-white shadow-none"
            >
              <CardContent className="space-y-5 p-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32 bg-slate-100" />
                  <Skeleton className="h-3 w-24 bg-slate-100" />
                </div>
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-3 w-full bg-slate-100" />
                  <Skeleton className="h-3 w-3/5 bg-slate-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ParkingEmptyStateProps {
  onAddLocation: () => void;
}

function ParkingEmptyState({ onAddLocation }: ParkingEmptyStateProps) {
  return (
    <Empty className="min-h-80 border border-dashed border-slate-200 bg-white py-16">
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

interface NoMatchingLocationsProps {
  onClearFilters: () => void;
}

function NoMatchingLocations({ onClearFilters }: NoMatchingLocationsProps) {
  return (
    <Empty className="min-h-72 border border-dashed border-slate-200 bg-white py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-slate-100 text-slate-600">
          <CircleX className="size-6" />
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold text-slate-950">
          No matching locations
        </EmptyTitle>
        <EmptyDescription className="max-w-sm text-slate-500">
          Try adjusting your search or filters.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      </EmptyContent>
    </Empty>
  );
}
