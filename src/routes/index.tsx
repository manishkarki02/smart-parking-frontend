import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user) {
      throw redirect({ to: "/login" });
    }

    // Redirect based on role
    switch (user.role) {
      case "ADMIN":
        throw redirect({ to: "/dashboard" });
      case "VENDOR":
        throw redirect({ to: "/vendor/parking" });
      default:
        throw redirect({ to: "/parking" });
    }
  },
  component: () => null,
});
