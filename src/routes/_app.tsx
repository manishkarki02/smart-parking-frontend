import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/common/components/AppLayout";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";

export const Route = createFileRoute("/_app")({
  component: AppLayoutRoute,
});

function AppLayoutRoute() {
  const { isAuthorized } = useAuthGuard();

  if (!isAuthorized) {
    return null;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
