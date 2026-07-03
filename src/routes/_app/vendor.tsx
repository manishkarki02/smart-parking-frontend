import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteGuard } from "@/common/components/RouteGuard";

export const Route = createFileRoute("/_app/vendor")({
  component: VendorLayoutRoute,
});

function VendorLayoutRoute() {
  return (
    <RouteGuard allowedRoles={["VENDOR"]}>
      <Outlet />
    </RouteGuard>
  );
}
