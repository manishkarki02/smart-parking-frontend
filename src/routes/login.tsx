import { createFileRoute, redirect } from "@tanstack/react-router";
import { PublicShell } from "@/common/components/PublicShell";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHomePath } from "@/features/auth/utils/get-auth-home-path";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      throw redirect({ to: getAuthHomePath(auth.user) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <PublicShell>
      <LoginForm />
    </PublicShell>
  );
}
