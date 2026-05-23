import { createFileRoute, redirect } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHomePath } from "@/features/auth/utils/get-auth-home-path";

export const Route = createFileRoute("/_public/register")({
  beforeLoad: () => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      throw redirect({ to: getAuthHomePath(auth.user) });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  return <RegisterForm />;
}
