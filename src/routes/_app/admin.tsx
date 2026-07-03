import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteGuard } from "@/common/components/RouteGuard";

export const Route = createFileRoute("/_app/admin")({
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <Outlet />
    </RouteGuard>
  );
}
