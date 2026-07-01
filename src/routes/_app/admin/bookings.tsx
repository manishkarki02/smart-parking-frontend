import { createFileRoute } from "@tanstack/react-router";
import { AdminBookingsPage } from "@/features/admin/pages/AdminBookingsPage";

export const Route = createFileRoute("/_app/admin/bookings")({
  component: AdminBookingsPage,
});
