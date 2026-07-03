import { createFileRoute } from "@tanstack/react-router";
import { RouteGuard } from "@/common/components/RouteGuard";
import { DriverSettingsPage } from "@/features/users/pages/DriverSettingsPage";

export const Route = createFileRoute("/_app/profile")({
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <RouteGuard allowedRoles={["DRIVER"]}>
      <DriverSettingsPage />
    </RouteGuard>
  );
}
