import { createFileRoute } from "@tanstack/react-router";
import { VendorParkingPage } from "@/features/vendor/pages/VendorParkingPage";

export const Route = createFileRoute("/_app/vendor/parkings")({
  component: VendorParkingPage,
});
