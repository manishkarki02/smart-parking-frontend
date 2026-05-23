import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { PublicShell } from "@/common/components/PublicShell";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHomePath } from "@/features/auth/utils/get-auth-home-path";

export const Route = createFileRoute("/_public")({
  beforeLoad: () => {
    const auth = useAuthStore.getState();

    if (auth.isAuthenticated()) {
      throw redirect({
        to: getAuthHomePath(auth.user),
      });
    }
  },
  component: PublicRouteLayout,
});

function PublicRouteLayout() {
  return (
    <PublicShell>
      <Outlet />
    </PublicShell>
  );
}
