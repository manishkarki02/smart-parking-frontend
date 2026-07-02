import { createFileRoute } from "@tanstack/react-router";
import { DriverSettingsPage } from "@/features/users/pages/DriverSettingsPage";

export const Route = createFileRoute("/profile")({
  component: DriverSettingsPage,
});
