import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/features/admin/services/admin.service";
import { StatsCard } from "@/common/components/StatsCard";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Loader2,
  MapPin,
  Navigation,
  ParkingCircle,
  Users,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import useParkingSlots from "@/features/parkings/hooks/useParkingSlots";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthorized } = useAuthGuard();
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: getDashboard,
    enabled: isAuthorized && user?.role === "ADMIN",
  });
  const { locations, isLoading: isParkingLoading } = useParkingSlots();

  useEffect(() => {
    if (isAuthorized && user?.role === "VENDOR") {
      void navigate({ to: "/vendor/dashboard", replace: true });
    }
  }, [isAuthorized, navigate, user?.role]);

  if (!isAuthorized) {
    return null;
  }

  if (user?.role === "VENDOR") {
    return null;
  }

  if (user?.role === "DRIVER") {
    return <DriverDashboardPage locations={locations} isLoading={isParkingLoading} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      <Card className="rounded-none sm:rounded-lg p-6 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Bookings"
              value={stats?.totalBookings ?? 0}
              icon={<CalendarCheck className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Total Vendors"
              value={stats?.totalVendors ?? 0}
              icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Total Drivers"
              value={stats?.totalDrivers ?? 0}
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function DriverDashboardPage({
  locations,
  isLoading,
}: {
  locations: ParkingLocation[] | undefined;
  isLoading: boolean;
}) {
  const availableLocations =
    locations?.filter((location) => location.availableSlots > 0) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Parking Spaces"
          value={locations?.length ?? 0}
          icon={<ParkingCircle className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Available Now"
          value={availableLocations.length}
          icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="My Bookings"
          value="View"
          icon={<CalendarCheck className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Parking Spaces
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a location to view details and book a slot.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/parking/map">Open map</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-lg border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {locations?.map((location) => (
              <Card
                key={location.id}
                className="group overflow-hidden border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-1 text-lg">
                      {location.name}
                    </CardTitle>
                    <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      ${(location.id % 5) + 2}/hr
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="line-clamp-1">{location.address}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Navigation className="mr-2 h-4 w-4 text-primary/70" />
                    <span>
                      {location.distance !== undefined
                        ? `${location.distance?.toFixed(1)} km away`
                        : "Distance unknown"}
                    </span>
                  </div>
                  <p className="font-medium">
                    <span className="font-bold text-primary">
                      {location.availableSlots}
                    </span>{" "}
                    spots left
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link
                      to="/parking/$id"
                      params={{ id: location.id.toString() }}
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {!locations?.length && (
              <Empty className="col-span-full border bg-card">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ParkingCircle />
                  </EmptyMedia>
                  <EmptyTitle>No parking spots available</EmptyTitle>
                  <EmptyDescription>
                    There are no parking spaces listed right now. Please check
                    back later.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
