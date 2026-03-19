import { createFileRoute } from "@tanstack/react-router";
import { BookingForm } from "@/features/booking/components/BookingForm";
import { z } from "zod";

const searchSchema = z.object({
  parkingLocationId: z.coerce.number().optional(),
});

export const Route = createFileRoute("/_app/bookings/new")({
  validateSearch: searchSchema,
  component: NewBookingPage,
});

function NewBookingPage() {
  const { parkingLocationId } = Route.useSearch();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Booking</h1>
        <p className="text-muted-foreground mt-1">
          Book a parking spot for your vehicle
        </p>
      </div>

      <BookingForm preselectedParkingId={parkingLocationId} />
    </div>
  );
}
