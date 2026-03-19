import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/common/components/AppLayout";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    // Auth disabled for UI testing
  },
  component: AppLayoutRoute,
});

function AppLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
