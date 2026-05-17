import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { VendorDashboardPage } from "@/features/vendor/components/VendorDashboardPage";

export const Route = createFileRoute("/_app/vendor/dashboard")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "VENDOR") {
      throw redirect({ to: "/" });
    }
  },
  component: VendorDashboardPage,
});
