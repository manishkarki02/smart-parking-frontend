import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PublicShell } from "@/common/components/PublicShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Loader2,
  ParkingCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import useParkingSlots from "@/features/parkings/hooks/useParkingSlots";
import { getAuthHomePath } from "@/features/auth/utils/get-auth-home-path";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      throw redirect({ to: getAuthHomePath(auth.user) });
    }
  },
  component: HomePage,
});

function HomePage() {
  const { locations, isLoading } = useParkingSlots();

  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="relative w-full h-75 md:h-100 flex items-center justify-center overflow-hidden bg-[#F0FDF4]">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 drop-shadow-sm">
            Find Your Perfect{" "}
            <span className="bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Parking Space
            </span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-900 font-medium  max-w-2xl mx-auto">
            Discover convenient, secure, and affordable parking spots around
            you. Book in seconds and drive with peace of mind.
          </p>
        </div>
      </section>

      {/* Parking Spaces Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Parking Spaces</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {locations?.map((location) => (
              <Card
                key={location.id}
                className="group overflow-hidden border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                <CardHeader className="pb-4 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {location.name}
                    </CardTitle>
                   <div className="px-3 py-1 bg-green-100 text-green-700 font-semibold text-sm rounded-full">
                      ${(location.id % 5) + 2}/hr
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                    <span className="line-clamp-1">{location.address}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground text-sm">
                    <Navigation className="w-4 h-4 mr-2 text-primary/70" />
                    <span>
                      {location.distance !== undefined
                        ? `${location.distance.toFixed(1)} km away`
                        : "Distance unknown"}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <span className="text-primary font-bold">
                        {location.availableSlots}
                      </span>{" "}
                      spots left
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 pt-4">
                  <Button
                    asChild
                    className="w-full group-hover:bg-primary transition-colors"
                  >
                    <Link
                      to="/parking/$id"
                      params={{ id: location.id.toString() }}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
    </PublicShell>
  );
}
