import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { RouteGuard } from "@/common/components/RouteGuard";
import { DriverBookingsPage } from "@/features/bookings/pages/DriverBookingsPage";

const bookingsSearchSchema = z.object({
  parkingLocationId: z.string().optional(),
  paymentSuccess: z.coerce.boolean().optional(),
  bookingId: z.string().optional(),
  paymentId: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  amount: z.coerce.number().optional(),
  transactionId: z.string().optional(),
  paidAt: z.string().optional(),
  pidx: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/_app/bookings/")({
  validateSearch: bookingsSearchSchema,
  component: BookingsRoute,
});

function BookingsRoute() {
  const search = Route.useSearch();

  return (
    <RouteGuard allowedRoles={["DRIVER"]}>
      <DriverBookingsPage
        parkingLocationId={search.parkingLocationId}
        payment={search}
      />
    </RouteGuard>
  );
}
