import { createFileRoute } from "@tanstack/react-router";
import { VendorDashboardPage } from "@/features/vendor/pages/VendorDashboardPage";

export const Route = createFileRoute("/_app/vendor/dashboard")({
  component: VendorDashboardPage,
});
