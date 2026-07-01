import { createFileRoute } from "@tanstack/react-router";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { VendorDashboardPage } from "@/features/vendor/pages/VendorDashboardPage";

export const Route = createFileRoute("/_app/vendor/dashboard")({
  component: VendorDashboardRoute,
});

function VendorDashboardRoute() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });

  if (!isAuthorized) {
    return null;
  }

  return <VendorDashboardPage />;
}
