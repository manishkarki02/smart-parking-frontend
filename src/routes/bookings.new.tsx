import { createFileRoute, redirect } from "@tanstack/react-router";
import { BookingForm } from "@/features/booking/components/BookingForm";
import { z } from "zod";
import { DriverLayout } from "@/common/components/DriverLayout";
import { useAuthStore } from "@/store/auth-store";

const searchSchema = z.object({
  parkingLocationId: z.coerce.number().optional(),
});

export const Route = createFileRoute("/bookings/new")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== "DRIVER") {
      throw redirect({ to: "/" });
    }
  },
  component: NewBookingPage,
});

function NewBookingPage() {
  const { parkingLocationId } = Route.useSearch();

  return (
    <DriverLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-green-600 bg-clip-text text-transparent mb-2">
            Secure Your Spot
          </h1>
          <p className="text-lg text-muted-foreground w-full max-w-xl mx-auto">
            Book a parking spot ahead of time to ensure your vehicle is safe and waiting for you.
          </p>
        </div>

        <div className="flex justify-center">
          <BookingForm preselectedParkingId={parkingLocationId} />
        </div>
      </div>
    </DriverLayout>
  );
}
