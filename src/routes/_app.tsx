import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/common/components/AppLayout";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
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
