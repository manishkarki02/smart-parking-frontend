import { createFileRoute, redirect } from "@tanstack/react-router";
import { HomePage } from "@/features/parkings/pages/HomePage";
import { getAuthHomePath } from "@/features/auth/utils/get-auth-home-path";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      throw redirect({ to: getAuthHomePath(auth.user) });
    }
  },
  component: HomePage,
});
