import { createFileRoute } from "@tanstack/react-router";
import { VendorSettingsPage } from "@/features/vendor/pages/VendorSettingsPage";

export const Route = createFileRoute("/_app/vendor/settings")({
  component: VendorSettingsPage,
});
