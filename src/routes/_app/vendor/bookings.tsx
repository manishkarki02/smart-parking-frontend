import { createFileRoute } from "@tanstack/react-router";
import { VendorBookingsPage } from "@/features/vendor/components/VendorBookingsPage";

export const Route = createFileRoute("/_app/vendor/bookings")({
  component: VendorBookingsPage,
});
