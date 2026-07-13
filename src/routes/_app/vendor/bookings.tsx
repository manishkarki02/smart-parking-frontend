import { createFileRoute } from "@tanstack/react-router";
import { VendorBookingsPage } from "@/features/vendor/pages/VendorBookingsPage";

export const Route = createFileRoute("/_app/vendor/bookings")({
  component: VendorBookingsPage,
});
