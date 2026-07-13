import { createFileRoute } from "@tanstack/react-router";
import { VendorEarningsPage } from "@/features/vendor/pages/VendorEarningsPage";

export const Route = createFileRoute("/_app/vendor/earnings")({
  component: VendorEarningsPage,
});
